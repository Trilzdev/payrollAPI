import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PaygradesService } from './paygrades.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('paygrades')
@UseGuards(JwtAuthGuard)
export class PaygradesController {
  constructor(private readonly paygradesService: PaygradesService) {}

  @Get()
  findAll() {
    return this.paygradesService.findAll();
  }

  @Post()
  create(@Body() data: { payGrade: string; basicSalary: number; housingAllowance: number; transportAllowance: number; departmentId: string }) {
    return this.paygradesService.create(data);
  }
}