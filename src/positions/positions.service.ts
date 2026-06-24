import { Injectable } from '@nestjs/common';
import { PrismaClient, PositionType } from '@prisma/client';

@Injectable()
export class PositionsService {
  private prisma = new PrismaClient();

  async findAll() {
    return this.prisma.departmentPosition.findMany({
      include: { department: true }, // Pulls in the department name!
      orderBy: { title: 'asc' }
    });
  }

  async create(data: { title: string; positionLevel: number; positionType: PositionType; hasDetergentAllowance: boolean; departmentId: string }) {
    return this.prisma.departmentPosition.create({ data });
  }
}