import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Customerpremiumschedule } from './customerpremiumschedule';

describe('Customerpremiumschedule', () => {
  let component: Customerpremiumschedule;
  let fixture: ComponentFixture<Customerpremiumschedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Customerpremiumschedule],
    }).compileComponents();

    fixture = TestBed.createComponent(Customerpremiumschedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
