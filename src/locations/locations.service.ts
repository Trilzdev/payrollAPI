import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class LocationsService {
  private prisma = new PrismaClient();

  async findAll() {
    return this.prisma.location.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async create(data: { name: string; locationType: string; hasLunchAllowance: boolean }) {
    return this.prisma.location.create({ data });
  }
}