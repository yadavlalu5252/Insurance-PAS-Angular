import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceCoverage } from './service-coverage';

describe('ServiceCoverage', () => {
  let component: ServiceCoverage;
  let fixture: ComponentFixture<ServiceCoverage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceCoverage],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceCoverage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
