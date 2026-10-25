import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paymentreceipt } from './paymentreceipt';

describe('Paymentreceipt', () => {
  let component: Paymentreceipt;
  let fixture: ComponentFixture<Paymentreceipt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paymentreceipt],
    }).compileComponents();

    fixture = TestBed.createComponent(Paymentreceipt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
