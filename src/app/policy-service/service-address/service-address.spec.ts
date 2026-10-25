import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceAddress } from './service-address';

describe('ServiceAddress', () => {
  let component: ServiceAddress;
  let fixture: ComponentFixture<ServiceAddress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceAddress],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceAddress);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
