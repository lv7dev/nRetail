import { Injectable } from '@nestjs/common';
import { OutletsRepository } from './outlets.repository';
import { MyOutletResponse } from './dto/my-outlet.response';

@Injectable()
/* istanbul ignore next */
export class OutletsService {
  constructor(private readonly outletsRepository: OutletsRepository) {}

  getMyOutlets(userId: string): Promise<MyOutletResponse[]> {
    return this.outletsRepository.findByUserId(userId);
  }
}
