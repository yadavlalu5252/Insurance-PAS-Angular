import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paymenthistory } from './paymenthistory';

describe('Paymenthistory', () => {
  let component: Paymenthistory;
  let fixture: ComponentFixture<Paymenthistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paymenthistory],
    }).compileComponents();

    fixture = TestBed.createComponent(Paymenthistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
