import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PaygradesService {
  private prisma = new PrismaClient();

  async findAll() {
    return this.prisma.departmentPaygrade.findMany({
      include: { department: true }, // Pulls in the department name!
      orderBy: { payGrade: 'asc' }
    });
  }

  async create(data: { payGrade: string; basicSalary: number; housingAllowance: number; transportAllowance: number; departmentId: string }) {
    return this.prisma.departmentPaygrade.create({ data });
  }
}