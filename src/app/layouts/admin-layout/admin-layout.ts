
import { Component, OnInit, inject } from '@angular/core';
import {
  DashboardMetrics,
  DashboardMetricsService
} from '../../core/services/dashboard-metrics.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout implements OnInit {

  private dashboardService = inject(DashboardMetricsService);

  metrics: DashboardMetrics = {
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    totalRoles: 0
  };

  ngOnInit(): void {
    this.dashboardService.getDashboardMetrics().subscribe({
      next: (response) => {
        if (response.success) {
          this.metrics = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading dashboard metrics', error);
      }
    });
  }
}
