import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Customerrefund } from './customerrefund';

describe('Customerrefund', () => {
  let component: Customerrefund;
  let fixture: ComponentFixture<Customerrefund>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Customerrefund],
    }).compileComponents();

    fixture = TestBed.createComponent(Customerrefund);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
