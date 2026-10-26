import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerRegistration } from './customer-registration';

describe('CustomerRegistration', () => {
  let component: CustomerRegistration;
  let fixture: ComponentFixture<CustomerRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerRegistration],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerRegistration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
