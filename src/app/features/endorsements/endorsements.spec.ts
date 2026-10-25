import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Endorsements } from './endorsements';

describe('Endorsements', () => {
  let component: Endorsements;
  let fixture: ComponentFixture<Endorsements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Endorsements],
    }).compileComponents();

    fixture = TestBed.createComponent(Endorsements);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
