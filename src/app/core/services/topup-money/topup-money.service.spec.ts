/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TopupMoneyService } from './topup-money.service';

describe('Service: TopupMoney', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TopupMoneyService]
    });
  });

  it('should ...', inject([TopupMoneyService], (service: TopupMoneyService) => {
    expect(service).toBeTruthy();
  }));
});
