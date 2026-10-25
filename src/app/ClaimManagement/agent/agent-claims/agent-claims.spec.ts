import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentClaims } from './agent-claims';

describe('AgentClaims', () => {
  let component: AgentClaims;
  let fixture: ComponentFixture<AgentClaims>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentClaims],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentClaims);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
