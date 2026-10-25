import { TestBed } from '@angular/core/testing';
import { Refundservice } from './refundservice';

describe('Refundservice', () => {
  let service: Refundservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Refundservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
