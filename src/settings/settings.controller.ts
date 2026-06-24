import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard) // Protect this just like the payroll routes!
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getGlobalSettings();
  }

  @Patch()
  updateSettings(@Body() updateDto: any) {
    return this.settingsService.updateGlobalSettings(updateDto);
  }
}