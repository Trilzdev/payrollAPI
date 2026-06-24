// src/payroll/payroll.service.ts
import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaClient, CompanySetting, Salary } from '@prisma/client';

@Injectable()
export class PayrollService {
  private prisma = new PrismaClient();

  async findAll() {
    // Fetch individual payslips (Salary) and include the employee details
    return this.prisma.salary.findMany({
      include: { 
        staff: true 
      },
      orderBy: { 
        // Optional: you can order by the month or creation date
        month: 'desc' 
      }, 
    });
  }

  async generateMonthlyPayroll(payload: {
    monthYear: string;
    workingDaysCount: number;
    employeeInputs: Array<{
      staffId: string;
      weekdayOtHours: number;
      sundayOtHours: number;
      monthlyHrsWorked: number;
      shiftHours: number;
      offshoreDays: number;
    }>;
  }) {
    // 1. Fetch the Master Global Settings
    const settings = await this.prisma.companySetting.findUnique({
      where: { id: 'GLOBAL' },
    });
    if (!settings) throw new InternalServerErrorException('Global settings not seeded!');

    // Prevent duplicate payroll runs for the same month
    const existingRun = await this.prisma.payrollRun.findUnique({
      where: { monthYear: payload.monthYear }
    });

    if (existingRun) {
      throw new BadRequestException(`A payroll run for ${payload.monthYear} already exists. Please delete it first if you want to recalculate.`);
    }

    // 2. Create the Payroll Run "Bucket"
    const payrollRun = await this.prisma.payrollRun.create({
      data: {
        monthYear: payload.monthYear,
        workingDaysCount: payload.workingDaysCount,
        weekendBonus: 6000,
        status: 'DRAFT',
      },
    });

    // 3. Loop through the incoming employee inputs and calculate/save
    const results: Salary[] = [];
    for (const input of payload.employeeInputs) {
      const staff = await this.prisma.staff.findUnique({
        where: { staffId: input.staffId },
        include: {
          position: true,
          location: true // <-- NEW: Fetching the relational location rules!
        },
      });

      if (!staff) continue;

      const paygrade = await this.prisma.departmentPaygrade.findUnique({
        where: {
          departmentId_payGrade: { // Updated constraint name
            departmentId: staff.departmentId, // Using the new relational ID
            payGrade: staff.payGrade,
          },
        },
      });

      if (!paygrade) continue;

      const isManager = staff.position.positionType === 'MANAGER';
      const isWelderOrFitter = staff.position.positionType === 'WELDER' || staff.position.positionType === 'FITTER';

      // RUN THE UPGRADED MATH ENGINE (Now passing Location & Detergent Rule)
      const employeePayslip = this.calculateEmployeePayslip(
        paygrade.basicSalary, paygrade.housingAllowance, paygrade.transportAllowance,
        payload.workingDaysCount, input, settings, isWelderOrFitter, isManager,
        staff.location, // <-- Passing the relational Location object
        staff.position.hasDetergentAllowance
      );

      const companyLiability = this.calculateCompanyLiabilities(
        employeePayslip.grossSalary, employeePayslip.actualBasic, employeePayslip.actualHousing, employeePayslip.actualTransport, settings
      );

      // SAVE TO DATABASE
      const savedSalary = await this.prisma.salary.create({
        data: {
          payrollRunId: payrollRun.id,
          staffId: staff.staffId,
          month: payload.monthYear,
          position: staff.position.title,
          project: 'DEFAULT',
          location: staff.location.name, // <-- Save the string snapshot for history
          level: staff.position.positionLevel,
          period: 'Monthly',

          monthlyHrsWorked: input.monthlyHrsWorked, // Using actual hours worked
          expectedMonthlyHrs: payload.workingDaysCount * input.shiftHours, // 22 days * 8 or 12 hrs
          weekdaySaturdayOtHours: input.weekdayOtHours,
          sundayPublicHolOtHours: input.sundayOtHours,
          offshoreDays: input.offshoreDays,

          weekdayOtRate: employeePayslip.hourlyRate * 1.5,
          weekendOtRate: employeePayslip.hourlyRate * 2.0,

          // Saving the Prorated "Actuals"
          actualBasic: employeePayslip.actualBasic,
          actualHousing: employeePayslip.actualHousing,
          actualTransport: employeePayslip.actualTransport,

          actualLunch: employeePayslip.lunch,
          actualUtility: settings.utilityAllowanceMonthly,
          actualHeat: employeePayslip.heat,
          actualXray: employeePayslip.xray,
          actualMilk: employeePayslip.milk,
          responsibilityAllowance: employeePayslip.responsibility,

          weekdayOtPay: employeePayslip.weekdayOtPay,
          weekendPublicHolOtPay: employeePayslip.sundayOtPay,
          weekendAllowance: employeePayslip.weekendBonus,

          grossSalary: employeePayslip.grossSalary,
          paye: employeePayslip.payeTax,
          pension: employeePayslip.pensionDeduction,
          totalDeduction: employeePayslip.pensionDeduction + employeePayslip.payeTax,
          netPay: employeePayslip.netPay,

          employerLiability: {
            create: {
              employerPension: companyLiability.employerPension,
              nsitf: companyLiability.nsitf,
              itf: companyLiability.itf,
              totalCompanyCost: companyLiability.totalCompanyCost,
            }
          }
        },
      });
      results.push(savedSalary);
    }

    return { message: 'Payroll calculated successfully', runId: payrollRun.id, recordsProcessed: results.length };
  }

  // --- UPGRADED INTERNAL MATH ENGINE ---
  private calculateEmployeePayslip(
    baseSalary: number, baseHousing: number, baseTransport: number, workingDays: number,
    inputs: { weekdayOtHours: number; sundayOtHours: number; monthlyHrsWorked: number; shiftHours: number; offshoreDays: number },
    settings: CompanySetting, isWelderOrFitter: boolean, isManager: boolean,
    location: { name: string; locationType: string; hasLunchAllowance: boolean }, // <-- NEW: Expected object type
    hasDetergentAllowance: boolean
  ) {
    // 1. Proration (Attendance Multiplier)
    const expectedMonthlyHrs = workingDays * inputs.shiftHours;
    const cappedHrsWorked = Math.min(inputs.monthlyHrsWorked, expectedMonthlyHrs);
    const attendanceMultiplier = cappedHrsWorked / expectedMonthlyHrs;

    const actualBasic = baseSalary * attendanceMultiplier;
    const actualHousing = baseHousing * attendanceMultiplier;
    const actualTransport = baseTransport * attendanceMultiplier;

    // 2. Allowances with Exceptions
    const utility = settings.utilityAllowanceMonthly;
    const heat = isWelderOrFitter ? settings.welderHeatMonthly : 0;
    const xray = isWelderOrFitter ? settings.welderXrayMonthly : 0;
    const milk = isWelderOrFitter ? (settings.welderMilkDaily * workingDays) : 0;
    const responsibility = isManager ? (actualBasic * settings.managerResponsibilityPct) : 0;
    const offshorePay = inputs.offshoreDays * 6000; // ₦6000 per day

    // Exception 1: Dynamic Lunch based on Location Rules
    const lunch = location.hasLunchAllowance ? (settings.lunchAllowanceDaily * workingDays) : 0;

    // Exception 2: Detergent is only paid if HR toggled it ON for this position
    const detergent = hasDetergentAllowance ? settings.detergentAllowanceMonthly : 0;

    // 3. Overtime Math (Using Shift Hours)
    const hourlyRate = (baseSalary / workingDays) / inputs.shiftHours;
    const weekdayOtPay = inputs.weekdayOtHours * (hourlyRate * 1.5);
    const sundayOtPay = inputs.sundayOtHours * (hourlyRate * 2.0);
    const weekendBonus = inputs.sundayOtHours > 0 ? 6000 : 0;

    // 4. Gross Salary (Adding Detergent and Offshore)
    const grossSalary = actualBasic + actualHousing + actualTransport + utility + lunch +
      heat + xray + milk + detergent + responsibility + offshorePay +
      weekdayOtPay + sundayOtPay + weekendBonus;

    // 5. Deductions (Based on actuals, not base)
    const pensionDeduction = (actualBasic + actualHousing + actualTransport) * settings.pensionEmployeePct;
    const payeTax = 0;
    const netPay = grossSalary - pensionDeduction - payeTax;

    return {
      hourlyRate, actualBasic, actualHousing, actualTransport,
      lunch, heat, xray, milk, detergent, responsibility, offshorePay,
      weekdayOtPay, sundayOtPay, weekendBonus, grossSalary, pensionDeduction, payeTax, netPay
    };
  }

  private calculateCompanyLiabilities(
    grossSalary: number, actualBasic: number, actualHousing: number, actualTransport: number, settings: CompanySetting
  ) {
    const employerPension = (actualBasic + actualHousing + actualTransport) * settings.pensionEmployerPct;
    const nsitf = grossSalary * settings.nsitfPct;
    const itf = grossSalary * settings.itfPct;
    return { employerPension, nsitf, itf, totalCompanyCost: employerPension + nsitf + itf };
  }
}

