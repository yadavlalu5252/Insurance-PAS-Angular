import { TestBed } from '@angular/core/testing';
import { PolicyriderService } from './policyrider-service';

describe('PolicyriderService', () => {
  let service: PolicyriderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolicyriderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
