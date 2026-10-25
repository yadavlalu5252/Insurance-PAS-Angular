
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import {
  CustomerDashboardService,
  CustomerDashboardMetrics,
  CustomerRecord,
  PolicyRecord,
  ProductRecord
} from '../../core/services/customer-dashboard.service';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.scss'
})
export class CustomerLayout implements OnInit, OnDestroy {

  constructor(
    private dashboardService: CustomerDashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  private productChartInstance?: Chart;
  private cityChartInstance?: Chart;

  private productCanvas?: HTMLCanvasElement;
  private cityCanvas?: HTMLCanvasElement;

  @ViewChild('productChart')
  set productChart(ref: ElementRef<HTMLCanvasElement> | undefined) {
    this.productCanvas = ref?.nativeElement;

    if (!this.productCanvas) {
      this.productChartInstance?.destroy();
      this.productChartInstance = undefined;
    } else {
      this.refreshProductChart();
    }
  }

  @ViewChild('cityChart')
  set cityChart(ref: ElementRef<HTMLCanvasElement> | undefined) {
    this.cityCanvas = ref?.nativeElement;

    if (!this.cityCanvas) {
      this.cityChartInstance?.destroy();
      this.cityChartInstance = undefined;
    } else {
      this.refreshCityChart();
    }
  }

  metrics: CustomerDashboardMetrics = {
    totalCustomers: 0,
    newCustomersToday: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    customersByCity: [],
    pendingKycCustomers: 0
  };

  customers: CustomerRecord[] = [];
  recentCustomers: CustomerRecord[] = [];
  products: ProductRecord[] = [];

  productCustomerCounts: {
    productName: string;
    totalCustomers: number;
  }[] = [];

  loading = true;
  errorMessage = '';

  customersLoading = false;
  customersError = '';

  productLoading = false;
  productError = '';

  ngOnInit(): void {
    this.loadDashboard();
    this.loadRecentCustomers();
    this.loadProductCustomers();
  }

  ngOnDestroy(): void {
    this.productChartInstance?.destroy();
    this.cityChartInstance?.destroy();
  }

  // Customers by Product pie chart
  private refreshProductChart(): void {
    const canvas = this.productCanvas;

    if (!canvas || this.productLoading || this.productError) {
      return;
    }

    const labels = this.productCustomerCounts.map(
      item => item.productName
    );

    const values = this.productCustomerCounts.map(
      item => item.totalCustomers
    );

    if (labels.length === 0 || !values.some(value => value > 0)) {
      this.productChartInstance?.destroy();
      this.productChartInstance = undefined;
      return;
    }

    if (this.productChartInstance?.canvas === canvas) {
      this.productChartInstance.data.labels = labels;
      this.productChartInstance.data.datasets[0].data = values;
      this.productChartInstance.update();
      return;
    }

    this.productChartInstance?.destroy();

    this.productChartInstance = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#2878e8',
            '#36ad83',
            '#ffc52f',
            '#9867e8'
          ],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            color: '#ffffff',
            font: {
              size: 14,
              weight: 'bold'
            },
            formatter: (value: number) => value > 0 ? value : ''
          },
          tooltip: {
            callbacks: {
              label: context => {
                const value = Number(context.raw);
                const total = values.reduce((sum, item) => sum + item, 0);
                const percentage = total > 0
                  ? Math.round(value / total * 100)
                  : 0;

                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Customers by City bar chart
  private refreshCityChart(): void {
    const canvas = this.cityCanvas;

    if (!canvas || this.loading || this.errorMessage) {
      return;
    }

    const cities = this.metrics.customersByCity ?? [];

    const labels = cities.map(item => item.city || 'Unknown');
    const values = cities.map(item => Number(item.totalCustomers) || 0);

    if (labels.length === 0) {
      this.cityChartInstance?.destroy();
      this.cityChartInstance = undefined;
      return;
    }

    if (this.cityChartInstance?.canvas === canvas) {
      this.cityChartInstance.data.labels = labels;
      this.cityChartInstance.data.datasets[0].data = values;
      this.cityChartInstance.update();
      return;
    }

    this.cityChartInstance?.destroy();

    this.cityChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Number of Customers',
          data: values,
          backgroundColor: '#4285ed',
          borderColor: '#4285ed',
          borderWidth: 1,
          barPercentage: 0.6,
          categoryPercentage: 0.7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: '#17233c',
            font: {
              size: 14,
              weight: 'bold'
            },
            formatter: (value: number) => value
          },
          tooltip: {
            callbacks: {
              label: context =>
                `Number of Customers: ${context.raw}`
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'City',
              color: '#222222'
            },
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            },
            title: {
              display: true,
              text: 'Number of Customers',
              color: '#222222'
            },
            grid: {
              color: '#e1e8f0'
            }
          }
        }
      }
    });
  }

  // Load dashboard metrics
  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.getCustomerDashboard().subscribe({
      next: response => {
        console.log('Customer dashboard response:', response);

        if (response?.success && response.data) {
          this.metrics = response.data;
        } else {
          this.errorMessage = 'Unable to load customer dashboard.';
        }

        this.loading = false;
        this.cdr.detectChanges();

        this.refreshCityChart();
      },
      error: error => {
        console.error('Customer dashboard error:', error);

        this.errorMessage =
          error.status === 401
            ? 'Your session has expired. Please log in again.'
            : error.status === 403
              ? 'You do not have permission to view this dashboard.'
              : 'Failed to load dashboard data. Please try again.';

        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Load the five most recent customers
  loadRecentCustomers(): void {
    this.customersLoading = true;
    this.customersError = '';

    this.dashboardService.getAllCustomers().subscribe({
      next: response => {
        console.log('All customers response:', response);

        this.customers = response?.data ?? [];

        this.recentCustomers = [...this.customers]
          .sort((a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          )
          .slice(0, 5);

        this.customersLoading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Recent customers error:', error);

        this.customersError =
          error.status === 401
            ? 'Your session has expired. Please log in again.'
            : error.status === 403
              ? 'You do not have permission to view customers.'
              : 'Failed to load recent customers.';

        this.customersLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Load products and count unique customers per product
  loadProductCustomers(): void {
    this.productLoading = true;
    this.productError = '';

    this.dashboardService.getAllProducts().subscribe({
      next: productResponse => {
        const productData = Array.isArray(productResponse)
          ? productResponse
          : productResponse?.data;

        if (!Array.isArray(productData)) {
          this.productError = 'Invalid product API response.';
          this.productLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.products = productData;

        this.dashboardService.getAllPolicies().subscribe({
          next: (policyResponse: any) => {
            const policies: PolicyRecord[] = Array.isArray(policyResponse)
              ? policyResponse
              : policyResponse?.data ?? [];

            this.productCustomerCounts = this.products.map(product => {
              const matchingPolicies = policies.filter(
                policy =>
                  Number(policy.product_id) === Number(product.product_id)
              );

              const uniqueCustomers = new Set(
                matchingPolicies.map(policy => Number(policy.customer_id))
              );

              return {
                productName: product.product_name,
                totalCustomers: uniqueCustomers.size
              };
            });

            this.productLoading = false;
            this.cdr.detectChanges();
            this.refreshProductChart();
          },
          error: error => {
            console.error('Policy API error:', error);

            this.productError =
              error.status === 401
                ? 'Authentication required to load policies.'
                : error.status === 403
                  ? 'You do not have permission to view policies.'
                  : 'Failed to load policy data.';

            this.productLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: error => {
        console.error('Product API error:', error);

        this.productError =
          error.status === 401
            ? 'Authentication required to load products.'
            : error.status === 403
              ? 'You do not have permission to view products.'
              : 'Failed to load products. Check the API connection.';

        this.productLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  getProductTotal(
  total: number,
  product: { totalCustomers: number }
): number {
  return total + product.totalCustomers;
}
}
