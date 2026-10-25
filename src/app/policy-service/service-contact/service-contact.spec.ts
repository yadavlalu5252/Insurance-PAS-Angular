import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceContact } from './service-contact';

describe('ServiceContact', () => {
  let component: ServiceContact;
  let fixture: ComponentFixture<ServiceContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceContact],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceContact);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
