import { Module } from '@nestjs/common';
import { PaygradesService } from './paygrades.service';
import { PaygradesController } from './paygrades.controller';

@Module({
  controllers: [PaygradesController],
  providers: [PaygradesService],
})
export class PaygradesModule {}
