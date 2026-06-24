import { Test, TestingModule } from '@nestjs/testing';
import { PaygradesService } from './paygrades.service';

describe('PaygradesService', () => {
  let service: PaygradesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaygradesService],
    }).compile();

    service = module.get<PaygradesService>(PaygradesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
