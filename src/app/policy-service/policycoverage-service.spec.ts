import { TestBed } from '@angular/core/testing';
import { PolicycoverageService } from './policycoverage-service';

describe('PolicycoverageService', () => {
  let service: PolicycoverageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolicycoverageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
