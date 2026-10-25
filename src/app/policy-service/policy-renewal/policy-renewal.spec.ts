import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolicyRenewal } from './policy-renewal';

describe('PolicyRenewal', () => {
  let component: PolicyRenewal;
  let fixture: ComponentFixture<PolicyRenewal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyRenewal],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyRenewal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
