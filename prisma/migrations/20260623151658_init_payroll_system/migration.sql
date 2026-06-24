-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED');

-- CreateEnum
CREATE TYPE "PositionType" AS ENUM ('MANAGER', 'WELDER', 'FITTER', 'NONE');

-- CreateEnum
CREATE TYPE "AuthRole" AS ENUM ('SUPER_HR', 'HR_MANAGER', 'AUDITOR');

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" TEXT NOT NULL,
    "monthYear" TEXT NOT NULL,
    "workingDaysCount" INTEGER NOT NULL DEFAULT 22,
    "weekendBonus" DOUBLE PRECISION NOT NULL DEFAULT 6000,
    "status" "RunStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "staffId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "bankSortCode" TEXT NOT NULL,
    "payGrade" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "locationId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("staffId")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationType" TEXT NOT NULL,
    "hasLunchAllowance" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentPosition" (
    "positionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "positionLevel" INTEGER NOT NULL,
    "positionType" "PositionType" NOT NULL DEFAULT 'NONE',
    "hasDetergentAllowance" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DepartmentPosition_pkey" PRIMARY KEY ("positionId")
);

-- CreateTable
CREATE TABLE "DepartmentPaygrade" (
    "id" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "payGrade" TEXT NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "housingAllowance" DOUBLE PRECISION NOT NULL,
    "transportAllowance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DepartmentPaygrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salary" (
    "id" TEXT NOT NULL,
    "payrollRunId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "monthlyHrsWorked" DOUBLE PRECISION NOT NULL,
    "expectedMonthlyHrs" DOUBLE PRECISION NOT NULL DEFAULT 168,
    "weekdaySaturdayOtHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sundayPublicHolOtHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weekendDays" INTEGER NOT NULL DEFAULT 0,
    "offshoreDays" INTEGER NOT NULL DEFAULT 0,
    "weekdayOtRate" DOUBLE PRECISION NOT NULL,
    "weekendOtRate" DOUBLE PRECISION NOT NULL,
    "offshoreRate" DOUBLE PRECISION NOT NULL DEFAULT 6000,
    "actualBasic" DOUBLE PRECISION NOT NULL,
    "actualHousing" DOUBLE PRECISION NOT NULL,
    "actualTransport" DOUBLE PRECISION NOT NULL,
    "actualLunch" DOUBLE PRECISION NOT NULL,
    "actualUtility" DOUBLE PRECISION NOT NULL,
    "actualXray" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualHeat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualMilk" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualDetergent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responsibilityAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "offshoreAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weekendAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weekdayOtPay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weekendPublicHolOtPay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "paye" DOUBLE PRECISION NOT NULL,
    "surcharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nhis" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pension" DOUBLE PRECISION NOT NULL,
    "totalDeduction" DOUBLE PRECISION NOT NULL,
    "netPay" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Salary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployerContribution" (
    "id" TEXT NOT NULL,
    "salaryId" TEXT NOT NULL,
    "employerPension" DOUBLE PRECISION NOT NULL,
    "nsitf" DOUBLE PRECISION NOT NULL,
    "itf" DOUBLE PRECISION NOT NULL,
    "hmoCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "groupLife" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCompanyCost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EmployerContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySetting" (
    "id" TEXT NOT NULL DEFAULT 'GLOBAL',
    "lunchAllowanceDaily" DOUBLE PRECISION NOT NULL DEFAULT 3000,
    "welderMilkDaily" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "utilityAllowanceMonthly" DOUBLE PRECISION NOT NULL DEFAULT 10000,
    "detergentAllowanceMonthly" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "welderHeatMonthly" DOUBLE PRECISION NOT NULL DEFAULT 15000,
    "welderXrayMonthly" DOUBLE PRECISION NOT NULL DEFAULT 15000,
    "managerResponsibilityPct" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
    "pensionEmployeePct" DOUBLE PRECISION NOT NULL DEFAULT 0.08,
    "pensionEmployerPct" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "nsitfPct" DOUBLE PRECISION NOT NULL DEFAULT 0.01,
    "itfPct" DOUBLE PRECISION NOT NULL DEFAULT 0.01,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AuthRole" NOT NULL DEFAULT 'HR_MANAGER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRun_monthYear_key" ON "PayrollRun"("monthYear");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentPaygrade_department_payGrade_key" ON "DepartmentPaygrade"("department", "payGrade");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerContribution_salaryId_key" ON "EmployerContribution"("salaryId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "DepartmentPosition"("positionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("staffId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerContribution" ADD CONSTRAINT "EmployerContribution_salaryId_fkey" FOREIGN KEY ("salaryId") REFERENCES "Salary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
