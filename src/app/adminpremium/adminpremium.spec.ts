import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Adminpremium } from './adminpremium';

describe('Adminpremium', () => {
  let component: Adminpremium;
  let fixture: ComponentFixture<Adminpremium>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Adminpremium],
    }).compileComponents();

    fixture = TestBed.createComponent(Adminpremium);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
