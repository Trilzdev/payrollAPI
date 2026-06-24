// src/payroll/payroll.controller.ts
import { Controller, Post, Body, UseGuards,Get } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // <-- 1. Import the guard

@Controller('payroll')
@UseGuards(JwtAuthGuard) // <-- 2. Lock down the entire controller
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) { }

  @Get()
  async getPayrollHistory() {
    return this.payrollService.findAll();
  }

  @Post('calculate')
  async calculatePayroll(
    @Body() payload: {
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
    }
  ) {
    return this.payrollService.generateMonthlyPayroll(payload);
  }
}