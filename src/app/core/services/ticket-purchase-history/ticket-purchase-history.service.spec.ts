/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TicketPurchaseHistoryService } from './ticket-purchase-history.service';

describe('Service: TicketPurchaseHistory', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TicketPurchaseHistoryService]
    });
  });

  it('should ...', inject([TicketPurchaseHistoryService], (service: TicketPurchaseHistoryService) => {
    expect(service).toBeTruthy();
  }));
});
