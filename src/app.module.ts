import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PayrollModule } from './payroll/payroll.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { DepartmentsModule } from './departments/departments.module';
import { SettingsModule } from './settings/settings.module';
import { PaygradesModule } from './paygrades/paygrades.module';
import { PositionsModule } from './positions/positions.module';
import { SalariesModule } from './salaries/salaries.module';
import { StaffModule } from './staff/staff.module';

@Module({
  imports: [PayrollModule, AuthModule, LocationsModule, DepartmentsModule, SettingsModule, PaygradesModule, PositionsModule, SalariesModule, StaffModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
