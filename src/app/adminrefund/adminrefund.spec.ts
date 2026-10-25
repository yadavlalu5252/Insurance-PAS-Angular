import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Adminrefund } from './adminrefund';

describe('Adminrefund', () => {
  let component: Adminrefund;
  let fixture: ComponentFixture<Adminrefund>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Adminrefund],
    }).compileComponents();

    fixture = TestBed.createComponent(Adminrefund);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
