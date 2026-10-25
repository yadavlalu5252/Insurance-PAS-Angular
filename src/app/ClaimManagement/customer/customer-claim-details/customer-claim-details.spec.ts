import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerClaimDetails } from './customer-claim-details';

describe('CustomerClaimDetails', () => {
  let component: CustomerClaimDetails;
  let fixture: ComponentFixture<CustomerClaimDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerClaimDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerClaimDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
