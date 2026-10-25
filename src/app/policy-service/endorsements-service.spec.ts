import { TestBed } from '@angular/core/testing';
import { EndorsementsService } from './endorsements-service';

describe('EndorsementsService', () => {
  let service: EndorsementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndorsementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
