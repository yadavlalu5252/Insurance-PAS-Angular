import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseReview } from './case-review';

describe('CaseReview', () => {
  let component: CaseReview;
  let fixture: ComponentFixture<CaseReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseReview],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
