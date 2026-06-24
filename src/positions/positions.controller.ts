import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PositionType } from '@prisma/client';

@Controller('positions')
@UseGuards(JwtAuthGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  findAll() {
    return this.positionsService.findAll();
  }

  @Post()
  create(@Body() data: { title: string; positionLevel: number; positionType: PositionType; hasDetergentAllowance: boolean; departmentId: string }) {
    return this.positionsService.create(data);
  }
}