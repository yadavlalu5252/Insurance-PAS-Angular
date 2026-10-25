import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolicyClosure } from './policy-closure';

describe('PolicyClosure', () => {
  let component: PolicyClosure;
  let fixture: ComponentFixture<PolicyClosure>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyClosure],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyClosure);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
