import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceNominee } from './service-nominee';

describe('ServiceNominee', () => {
  let component: ServiceNominee;
  let fixture: ComponentFixture<ServiceNominee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceNominee],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceNominee);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
