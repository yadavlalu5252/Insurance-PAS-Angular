import { TestBed } from '@angular/core/testing';
import { OtpContactpolicy } from './otp-contactpolicy';

describe('OtpContactpolicy', () => {
  let service: OtpContactpolicy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtpContactpolicy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
