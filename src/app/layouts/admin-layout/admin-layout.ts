
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout {
  sidebarOpen = true;

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.router.navigate(['/login']);
  }
}
