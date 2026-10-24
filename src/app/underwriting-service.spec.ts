import { TestBed } from '@angular/core/testing';
import { UnderwritingService } from './underwriting-service';

describe('UnderwritingService', () => {
  let service: UnderwritingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnderwritingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
