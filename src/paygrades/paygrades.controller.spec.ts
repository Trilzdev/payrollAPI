import { Test, TestingModule } from '@nestjs/testing';
import { PaygradesController } from './paygrades.controller';
import { PaygradesService } from './paygrades.service';

describe('PaygradesController', () => {
  let controller: PaygradesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaygradesController],
      providers: [PaygradesService],
    }).compile();

    controller = module.get<PaygradesController>(PaygradesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
