
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface AuditLog {
  id: number;
  moduleName: string;
  action: string;
  actorUserId?: string;
  actorRole?: string;
  entityType?: string;
  entityId?: string;
  outcome?: string;
  sourceService?: string;
  occurredAtUtc?: string;
  ipAddress?: string;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.scss'
})
export class AuditLogs {
  logs: AuditLog[] = [];
  searchText = '';
  selectedModule = '';
  selectedOutcome = '';
  loading = false;
  errorMessage = '';

  private readonly apiUrl =
    'https://localhost:7217/api/v1/audit-logs';

  constructor(private http: HttpClient) {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<AuditLog[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.logs = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'Could not load audit logs. Check that the API is running, the JWT is valid, and CORS is configured.';
        this.loading = false;
      }
    });
  }

  get filteredLogs(): AuditLog[] {
    const search = this.searchText.toLowerCase().trim();

    return this.logs.filter((log) => {
      const matchesSearch =
        !search ||
        `${log.moduleName} ${log.action} ${log.actorUserId ?? ''} ${log.sourceService ?? ''}`
          .toLowerCase()
          .includes(search);

      const matchesModule =
        !this.selectedModule ||
        log.moduleName === this.selectedModule;

      const matchesOutcome =
        !this.selectedOutcome ||
        log.outcome === this.selectedOutcome;

      return matchesSearch && matchesModule && matchesOutcome;
    });
  }

  get modules(): string[] {
    return [...new Set(this.logs.map(log => log.moduleName))];
  }

  get outcomes(): string[] {
    return [...new Set(
      this.logs.map(log => log.outcome).filter(
        (value): value is string => !!value
      )
    )];
  }

  get successfulEvents(): number {
  return this.logs.filter(
    log => log.outcome?.toLowerCase() === 'success'
  ).length;
}
}
