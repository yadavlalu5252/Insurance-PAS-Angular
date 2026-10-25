import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-agent-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './agent-layout.html',
  styleUrl: './agent-layout.scss'
})
export class AgentLayout {}
