import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AdviceItem, ClaimProcessService, SettlementRecord } from '../../claim-process-service';
import { getErrorMessage, unwrapData } from '../../claim-helpers';

@Component({
  selector: 'app-claim-settlement-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './claim-settlement-view.html',
  styleUrl: './claim-settlement-view.scss',
})
export class ClaimSettlementView implements OnInit {
  private service = inject(ClaimProcessService);
  private cd = inject(ChangeDetectorRef);

  @Input() claimId = 0;

  settlement: SettlementRecord | null = null;
  advice: AdviceItem | null = null;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.service
      .getSettlement(this.claimId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        }),
      )
      .subscribe({
        next: (response: any) => {
          this.settlement = unwrapData(response) ?? null;
        },
        error: () => {
          this.settlement = null;   // a 404 only means that it is not settled yet
        },
      });
  }

  showAdvice(): void {
    this.errorMessage = '';

    this.service.getAdvice(this.claimId).subscribe({
      next: (response: any) => {
        this.advice = unwrapData(response) ?? null;
        this.cd.detectChanges();
      },
      error: (error: any) => {
        this.errorMessage = getErrorMessage(error, 'The settlement advice could not be loaded.');
        this.cd.detectChanges();
      },
    });
  }
}
