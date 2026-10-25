import { TestBed } from '@angular/core/testing';
import { Premiumspaymentservice } from './premiumspaymentservice';

describe('Premiumspaymentservice', () => {
  let service: Premiumspaymentservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Premiumspaymentservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
