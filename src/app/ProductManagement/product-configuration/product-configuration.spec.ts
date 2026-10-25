import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductConfiguration } from './product-configuration';

describe('ProductConfiguration', () => {
  let component: ProductConfiguration;
  let fixture: ComponentFixture<ProductConfiguration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductConfiguration],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductConfiguration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
