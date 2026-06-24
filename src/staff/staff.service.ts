import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class StaffService {
  private prisma = new PrismaClient();

  async create(createDto: any) {
    // Prevent duplicate Staff IDs
    const existing = await this.prisma.staff.findUnique({ where: { staffId: createDto.staffId } });
    if (existing) throw new ConflictException('An employee with this Staff ID already exists.');

    return this.prisma.staff.create({ data: createDto });
  }

  // 🔥 This is the crucial endpoint for your React Timesheet Grid
  async findAll() {
    return this.prisma.staff.findMany({
      where: { isActive: true }, // Only fetch active employees for payroll
      orderBy: { name: 'asc' }, // Alphabetical order
      include: {
        department: true,
        location: true,
        position: true,
      },
    });
  }

  async findOne(staffId: string) {
    return this.prisma.staff.findUnique({
      where: { staffId },
      include: { department: true, location: true, position: true },
    });
  }

  async update(staffId: string, updateDto: any) {
    return this.prisma.staff.update({
      where: { staffId },
      data: updateDto,
    });
  }

  async remove(staffId: string) {
    // In HR systems, we rarely actually delete records. 
    // We do a "soft delete" by setting them to inactive.
    return this.prisma.staff.update({
      where: { staffId },
      data: { isActive: false },
    });
  }
}