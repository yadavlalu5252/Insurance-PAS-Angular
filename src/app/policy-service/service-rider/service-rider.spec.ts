import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceRider } from './service-rider';

describe('ServiceRider', () => {
  let component: ServiceRider;
  let fixture: ComponentFixture<ServiceRider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceRider],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceRider);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
