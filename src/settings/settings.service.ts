import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SettingsService {
  private prisma = new PrismaClient();

  async getGlobalSettings() {
    // Try to find the single global settings row
    let settings = await this.prisma.companySetting.findUnique({
      where: { id: 'GLOBAL' },
    });

    // If it doesn't exist yet (first boot), create it using your Prisma schema defaults
    if (!settings) {
      settings = await this.prisma.companySetting.create({
        data: { id: 'GLOBAL' },
      });
    }

    return settings;
  }

  async updateGlobalSettings(updateDto: any) {
    // Ensure the row exists before attempting to patch it
    await this.getGlobalSettings();

    // Update the row with the new values from the React form
    return this.prisma.companySetting.update({
      where: { id: 'GLOBAL' },
      data: updateDto,
    });
  }
}