import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentClaimDetails } from './agent-claim-details';

describe('AgentClaimDetails', () => {
  let component: AgentClaimDetails;
  let fixture: ComponentFixture<AgentClaimDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentClaimDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentClaimDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
