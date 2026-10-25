
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../core/services/agent.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  agentId = 2;

  activeCustomers = 0;
  agentSales = 0;
  totalCommission = 0;
  totalPremium = 0;

  loadingCustomers = false;
  loadingSales = false;
  loadingCommission = false;
  loadingPremium = false;

  customerError = '';
  salesError = '';
  commissionError = '';
  premiumError = '';

  constructor(
    private agentService: AgentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getActiveCustomers();
    this.getAgentSales();
    this.getCommissionReport();
    this.getPremiumCollection();
  }

  getActiveCustomers(): void {
    this.loadingCustomers = true;
    this.customerError = '';

    this.agentService.getCustomers(this.agentId).subscribe({
      next: (response: any) => {
        const customers = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        this.activeCustomers = customers.filter(
          (customer: any) =>
            customer.status?.toLowerCase() === 'active'
        ).length;

        this.loadingCustomers = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Customer API error:', error);
        this.customerError = 'Unable to load active customers.';
        this.loadingCustomers = false;
        this.cdr.detectChanges();
      }
    });
  }

  getAgentSales(): void {
    this.loadingSales = true;
    this.salesError = '';

    this.agentService.getPolicies(this.agentId).subscribe({
      next: (response: any) => {
        const policies = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        this.agentSales = policies.filter(
          (policy: any) =>
            policy.status?.toLowerCase() === 'sold'
        ).length;

        this.loadingSales = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Policy API error:', error);
        this.salesError = 'Unable to load agent sales.';
        this.loadingSales = false;
        this.cdr.detectChanges();
      }
    });
  }

  getCommissionReport(): void {
    this.loadingCommission = true;
    this.commissionError = '';

    this.agentService.getCommissions(this.agentId).subscribe({
      next: (response: any) => {
        const commissions = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        this.totalCommission = commissions.reduce(
          (total: number, item: any) =>
            total + Number(item.commissionAmount ?? 0),
          0
        );

        this.loadingCommission = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Commission API error:', error);
        this.commissionError = 'Unable to load commissions.';
        this.loadingCommission = false;
        this.cdr.detectChanges();
      }
    });
  }

  getPremiumCollection(): void {
    this.loadingPremium = true;
    this.premiumError = '';

    this.agentService.getPayments().subscribe({
      next: (response: any) => {
        console.log('Payments response:', response);

        const payments = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        this.totalPremium = payments.reduce(
          (total: number, payment: any) =>
            total + Number(payment.amount ?? 0),
          0
        );

        this.loadingPremium = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Payments API error:', error);
        this.premiumError = 'Unable to load premium collection.';
        this.loadingPremium = false;
        this.cdr.detectChanges();
      }
    });
  }
}
