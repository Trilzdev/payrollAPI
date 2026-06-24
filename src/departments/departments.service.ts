import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  private prisma = new PrismaClient();

  async findAll() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async create(data: { name: string; costCenterCode?: string }) {
    return this.prisma.department.create({ data });
  }
}