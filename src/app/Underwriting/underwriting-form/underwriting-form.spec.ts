import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnderwritingForm } from './underwriting-form';

describe('UnderwritingForm', () => {
  let component: UnderwritingForm;
  let fixture: ComponentFixture<UnderwritingForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderwritingForm],
    }).compileComponents();

    fixture = TestBed.createComponent(UnderwritingForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
