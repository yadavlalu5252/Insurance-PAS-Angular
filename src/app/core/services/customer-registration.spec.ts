import { TestBed } from '@angular/core/testing';
import { CustomerRegistration } from './customer-registration';

describe('CustomerRegistration', () => {
  let service: CustomerRegistration;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerRegistration);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
