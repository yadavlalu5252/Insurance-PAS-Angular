
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Report {
  report_id: number;
  name: string;
  endpoint: string;
  icon: string;
}

interface ScheduledReport {
  schedule_id?: number;
  id?: number;
  report_id: number;
  schedule_type: string;
  next_run_date: string;
  email_to: string;
  status: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss']
})
export class Reports implements OnInit {
  private api = 'https://localhost:7294/api/v1/reports';

  activeTab: 'reports' | 'scheduled' = 'reports';

  reports: Report[] = [
    { report_id: 1, name: 'Customers', endpoint: 'customers', icon: 'users' },
    { report_id: 2, name: 'Policies', endpoint: 'policies', icon: 'shield' },
    { report_id: 3, name: 'Premiums', endpoint: 'premiums', icon: 'rupee' },
    { report_id: 4, name: 'Claims', endpoint: 'claims', icon: 'file' },
    { report_id: 5, name: 'Underwriting', endpoint: 'underwriting', icon: 'check' },
    { report_id: 6, name: 'Agents', endpoint: 'agents', icon: 'user' },
    { report_id: 7, name: 'Financial', endpoint: 'financial', icon: 'chart' }
  ];

  scheduleTypes = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];

  selectedReport: Report = this.reports[0];

  rows: any[] = [];
  columns: string[] = [];
  schedules: ScheduledReport[] = [];

  loading = false;
  saving = false;
  scheduleLoading = false;
  errorMessage = '';
  scheduleMessage = '';

  scheduleForm = {
    report_id: 1,
    schedule_type: 'Daily',
    next_run_date: '',
    email_to: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReport(this.selectedReport);
    this.loadSchedules();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders({
      Accept: 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  selectReport(report: Report): void {
    this.selectedReport = report;
    this.loadReport(report);
  }

  loadReport(report: Report): void {
    this.loading = true;
    this.errorMessage = '';
    this.rows = [];
    this.columns = [];

    this.http.get<any>(`${this.api}/${report.endpoint}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        let data = response?.data ?? response;

        if (data && !Array.isArray(data) && Array.isArray(data.items)) {
          data = data.items;
        }

        if (data === null || data === undefined) {
          data = [];
        }

        this.rows = Array.isArray(data) ? data : [data];

        if (this.rows.length > 0 && typeof this.rows[0] === 'object') {
          this.columns = Object.keys(this.rows[0]);
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Report loading failed:', error);
        this.errorMessage =
          'Unable to load this report. Check that the API is running and try again.';
        this.loading = false;
      }
    });
  }

  refreshReport(): void {
    this.loadReport(this.selectedReport);
  }

  exportReport(type: 'csv' | 'excel' | 'pdf'): void {
    if (this.selectedReport.name !== 'Financial') {
      this.errorMessage =
        'Export is currently available only for the Financial report.';
      return;
    }

    this.errorMessage = '';

    this.http.get(`${this.api}/export/${type}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download =
          `financial-report.${type === 'excel' ? 'xlsx' : type}`;
        link.click();

        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Export failed:', error);
        this.errorMessage = 'Export failed. Please check the API and try again.';
      }
    });
  }

  saveSchedule(): void {
    this.scheduleMessage = '';

    if (
      !this.scheduleForm.report_id ||
      !this.scheduleForm.schedule_type ||
      !this.scheduleForm.next_run_date ||
      !this.scheduleForm.email_to.trim()
    ) {
      this.scheduleMessage = 'Please fill in all schedule fields.';
      return;
    }

    const payload = {
      report_id: Number(this.scheduleForm.report_id),
      schedule_type: this.scheduleForm.schedule_type,
      next_run_date: this.scheduleForm.next_run_date,
      email_to: this.scheduleForm.email_to.trim(),
      status: 'Active'
    };

    this.saving = true;

    this.http.post(`${this.api}/schedule`, payload, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.saving = false;
        this.scheduleMessage = 'Schedule saved successfully.';

        this.scheduleForm = {
          report_id: this.scheduleForm.report_id,
          schedule_type: 'Daily',
          next_run_date: '',
          email_to: ''
        };

        this.loadSchedules();
      },
      error: (error) => {
        console.error('Saving schedule failed:', error);
        this.saving = false;
        this.scheduleMessage =
          'Unable to save schedule. Check the API and try again.';
      }
    });
  }

  loadSchedules(): void {
    this.scheduleLoading = true;

    this.http.get<any>(`${this.api}/schedule`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        const data = response?.data ?? response;
        this.schedules = Array.isArray(data) ? data : [];
        this.scheduleLoading = false;
      },
      error: (error) => {
        console.error('Loading schedules failed:', error);
        this.schedules = [];
        this.scheduleLoading = false;
      }
    });
  }

  deleteSchedule(schedule: ScheduledReport): void {
    const id = schedule.schedule_id ?? schedule.id;

    if (id === undefined || id === null) {
      this.scheduleMessage = 'Schedule ID was not returned by the API.';
      return;
    }

    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    this.http.delete(`${this.api}/schedule/${id}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.scheduleMessage = 'Schedule deleted successfully.';
        this.loadSchedules();
      },
      error: (error) => {
        console.error('Deleting schedule failed:', error);
        this.scheduleMessage =
          'Unable to delete schedule. Check the API and try again.';
      }
    });
  }

  getReportName(reportId: number): string {
    return this.reports.find(
      report => report.report_id === Number(reportId)
    )?.name ?? 'Unknown report';
  }

  getCellValue(row: any, column: string): string {
    const value = row?.[column];

    if (value === null || value === undefined) {
      return '-';
    }

    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }

  formatColumn(column: string): string {
    return column
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  trackByColumn(index: number, column: string): string {
    return column;
  }

  trackByRow(index: number, row: any): any {
    return row?.id ?? row?.customer_id ?? row?.policy_id ?? index;
  }

  trackBySchedule(index: number, schedule: ScheduledReport): any {
    return schedule.schedule_id ?? schedule.id ?? index;
  }
}
