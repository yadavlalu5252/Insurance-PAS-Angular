import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolicyCancellation } from './policy-cancellation';

describe('PolicyCancellation', () => {
  let component: PolicyCancellation;
  let fixture: ComponentFixture<PolicyCancellation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyCancellation],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyCancellation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
