import { PartialType } from '@nestjs/mapped-types';
import { CreatePaygradeDto } from './create-paygrade.dto';

export class UpdatePaygradeDto extends PartialType(CreatePaygradeDto) {}
