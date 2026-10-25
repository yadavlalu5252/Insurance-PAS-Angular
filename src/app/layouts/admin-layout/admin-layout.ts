import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DashboardMetrics, DashboardMetricsService } from '../../core/services/dashboard-metrics.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout implements OnInit {

  private dashboardService = inject(DashboardMetricsService);
  private cdr = inject(ChangeDetectorRef);

  metrics: DashboardMetrics = {
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    totalRoles: 0
  };

  ngOnInit(): void {
    this.dashboardService.getDashboardMetrics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.metrics = { ...response.data };
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Dashboard API error:', error);
      }
    });
  }
}
