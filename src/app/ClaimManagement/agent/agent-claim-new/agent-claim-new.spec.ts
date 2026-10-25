import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentClaimNew } from './agent-claim-new';

describe('AgentClaimNew', () => {
  let component: AgentClaimNew;
  let fixture: ComponentFixture<AgentClaimNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentClaimNew],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentClaimNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
