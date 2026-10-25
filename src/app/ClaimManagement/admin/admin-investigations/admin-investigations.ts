import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ClaimProcessService, InvestigationRecord } from '../../../claim-process-service';
import { getErrorMessage } from '../../../claim-helpers';

@Component({
  selector: 'app-admin-investigations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-investigations.html',
  styleUrl: './admin-investigations.scss',
})
export class AdminInvestigations implements OnInit {
  private service = inject(ClaimProcessService);
  private cd = inject(ChangeDetectorRef);

  statuses = ['Pending', 'Completed'];

  items: InvestigationRecord[] = [];
  total = 0;
  currentPage = 1;
  totalPages = 1;
  loading = false;
  errorMessage = '';

  selectedStatus = '';
  claimId: number | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cd.detectChanges();

    this.service
      .listInvestigations(this.currentPage, this.selectedStatus, this.claimId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        }),
      )
      .subscribe({
        next: (response: any) => {
          const data = response?.data;
          this.items = data?.items ?? [];
          this.total = data?.total_records ?? 0;
          this.totalPages = Math.max(data?.total_pages ?? 1, 1);
        },
        error: (error: any) => {
          this.items = [];
          this.errorMessage = getErrorMessage(error, 'The investigations could not be loaded.');
        },
      });
  }

  filter(): void {
    this.currentPage = 1;
    this.load();
  }

  clear(): void {
    this.selectedStatus = '';
    this.claimId = null;
    this.filter();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.load();
  }
}