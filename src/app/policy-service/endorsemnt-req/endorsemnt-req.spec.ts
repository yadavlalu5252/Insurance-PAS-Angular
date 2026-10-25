import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndorsemntReq } from './endorsemnt-req';

describe('EndorsemntReq', () => {
  let component: EndorsemntReq;
  let fixture: ComponentFixture<EndorsemntReq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndorsemntReq],
    }).compileComponents();

    fixture = TestBed.createComponent(EndorsemntReq);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
