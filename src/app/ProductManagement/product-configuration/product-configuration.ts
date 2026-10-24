
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../product-service';

@Component({
  selector: 'app-product-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-configuration.html',
  styleUrl: './product-configuration.scss'
})
export class ProductConfiguration implements OnInit {

  productId: number | null = null;

  // ==================== COMMON ====================

  isSaving = false;
  errorMessage = '';
  successMessage = '';

  // ==================== COVERAGE ====================

  coverages: any[] = [];
  isLoading = false;

  showCoverageModal = false;
  isEditingCoverage = false;
  editingCoverageId: number | null = null;

  coverageForm: any = this.emptyCoverageForm();

  // ==================== BENEFIT ====================

  benefits: any[] = [];
  isLoadingBenefits = false;

  showBenefitModal = false;
  isEditingBenefit = false;
  editingBenefitId: number | null = null;

  benefitForm: any = this.emptyBenefitForm();

  // ==================== RIDER ====================

  riders: any[] = [];
  isLoadingRiders = false;

  showRiderModal = false;
  isEditingRider = false;
  editingRiderId: number | null = null;

  riderForm: any = this.emptyRiderForm();

  // ==================== PREMIUM FREQUENCY ====================

  premiumFrequencies: any[] = [];
  isLoadingFrequencies = false;

  showFrequencyModal = false;
  isEditingFrequency = false;
  editingFrequencyId: number | null = null;

  frequencyForm: any = this.emptyFrequencyForm();

  // ==================== COMMISSION ====================

  commissions: any[] = [];
  isLoadingCommissions = false;

  showCommissionModal = false;
  isEditingCommission = false;
  editingCommissionId: number | null = null;

  commissionForm: any = this.emptyCommissionForm();

  // ==================== PRODUCT / SUM INSURED ====================

  product: any = null;

  showSumInsuredModal = false;
  showActivationModal = false;

  sumInsuredForm: any = {
    minimum_sum_insured: null,
    maximum_sum_insured: null
  };

  activationStatus = 'Active';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ps: ProductService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      this.productId = id;

      this.loadCoverages();
      this.loadBenefits();
      this.loadRiders();
      this.loadPremiumFrequencies();
      this.loadCommissions();
      this.loadProduct();
    } else {
      this.router.navigate(['/products']);
    }
  }

  // ==================================================
  // COVERAGE
  // ==================================================

  emptyCoverageForm(): any {
    return {
      coverage_name: '',
      minimum_coverage: null,
      maximum_coverage: null,
      waiting_period_days: null,
      deductible_amount: null
    };
  }

  loadCoverages(): void {
    if (this.productId === null) return;

    this.isLoading = true;

    this.ps.getCoverages().subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res;

        this.coverages = (Array.isArray(rows) ? rows : [])
          .filter(
            (item: any) =>
              Number(item.product_id) === this.productId
          );

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Coverage loading error:', err);
        this.errorMessage =
          'Unable to load coverage. Check your API and login.';
        this.isLoading = false;
      }
    });
  }

  openAddCoverage(): void {
    this.coverageForm = this.emptyCoverageForm();
    this.isEditingCoverage = false;
    this.editingCoverageId = null;
    this.errorMessage = '';
    this.showCoverageModal = true;
  }

  openEditCoverage(coverage: any): void {
    this.coverageForm = {
      coverage_name: coverage.coverage_name ?? '',
      minimum_coverage: coverage.minimum_coverage ?? null,
      maximum_coverage: coverage.maximum_coverage ?? null,
      waiting_period_days: coverage.waiting_period_days ?? null,
      deductible_amount: coverage.deductible_amount ?? null
    };

    this.isEditingCoverage = true;
    this.editingCoverageId = coverage.coverage_id;
    this.errorMessage = '';
    this.showCoverageModal = true;
  }

  closeCoverageModal(): void {
    if (this.isSaving) return;
    this.showCoverageModal = false;
  }

  saveCoverage(): void {
    if (this.productId === null) return;

    if (!this.coverageForm.coverage_name?.trim()) {
      this.errorMessage = 'Please enter a coverage name.';
      return;
    }

    if (
      this.coverageForm.minimum_coverage != null &&
      this.coverageForm.maximum_coverage != null &&
      Number(this.coverageForm.minimum_coverage) >
        Number(this.coverageForm.maximum_coverage)
    ) {
      this.errorMessage =
        'Minimum coverage cannot exceed maximum coverage.';
      return;
    }

    const payload = {
      ...this.coverageForm,
      product_id: this.productId,

      minimum_coverage:
        this.coverageForm.minimum_coverage === '' ||
        this.coverageForm.minimum_coverage == null
          ? null
          : Number(this.coverageForm.minimum_coverage),

      maximum_coverage:
        this.coverageForm.maximum_coverage === '' ||
        this.coverageForm.maximum_coverage == null
          ? null
          : Number(this.coverageForm.maximum_coverage),

      waiting_period_days:
        this.coverageForm.waiting_period_days === '' ||
        this.coverageForm.waiting_period_days == null
          ? null
          : Number(this.coverageForm.waiting_period_days),

      deductible_amount:
        this.coverageForm.deductible_amount === '' ||
        this.coverageForm.deductible_amount == null
          ? null
          : Number(this.coverageForm.deductible_amount)
    };

    const wasEditing = this.isEditingCoverage;

    this.isSaving = true;
    this.errorMessage = '';

    const request =
      wasEditing && this.editingCoverageId !== null
        ? this.ps.updateCoverage(this.editingCoverageId, payload)
        : this.ps.addCoverage(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.showCoverageModal = false;
        this.successMessage = wasEditing
          ? 'Coverage updated successfully.'
          : 'Coverage added successfully.';
        this.loadCoverages();
      },
      error: (err: any) => {
        console.error('Coverage save error:', err);
        this.isSaving = false;
        this.errorMessage =
          err.error?.message ??
          'Unable to save coverage. Check authorization and API.';
      }
    });
  }

  deleteCoverage(id: number): void {
    if (!confirm('Are you sure you want to delete this coverage?')) {
      return;
    }

    this.ps.deleteCoverage(id).subscribe({
      next: () => {
        this.successMessage = 'Coverage deleted successfully.';
        this.loadCoverages();
      },
      error: (err: any) => {
        console.error('Coverage delete error:', err);
        this.errorMessage = 'Unable to delete coverage.';
      }
    });
  }

  // ==================================================
  // BENEFIT
  // ==================================================

  emptyBenefitForm(): any {
    return {
      benefit_name: '',
      benefit_description: '',
      benefit_limit: null
    };
  }

  loadBenefits(): void {
    if (this.productId === null) return;

    this.isLoadingBenefits = true;

    this.ps.getBenefits().subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res;

        this.benefits = (Array.isArray(rows) ? rows : [])
          .filter(
            (item: any) =>
              Number(item.product_id) === this.productId
          );

        this.isLoadingBenefits = false;
      },
      error: (err: any) => {
        console.error('Benefit loading error:', err);
        this.isLoadingBenefits = false;
        this.errorMessage =
          'Unable to load benefits. Check your API and login.';
      }
    });
  }

  openAddBenefit(): void {
    this.benefitForm = this.emptyBenefitForm();
    this.isEditingBenefit = false;
    this.editingBenefitId = null;
    this.errorMessage = '';
    this.showBenefitModal = true;
  }

  openEditBenefit(benefit: any): void {
    this.benefitForm = {
      benefit_name: benefit.benefit_name ?? '',
      benefit_description: benefit.benefit_description ?? '',
      benefit_limit: benefit.benefit_limit ?? null
    };

    this.isEditingBenefit = true;
    this.editingBenefitId = benefit.benefit_id;
    this.errorMessage = '';
    this.showBenefitModal = true;
  }

  closeBenefitModal(): void {
    if (this.isSaving) return;
    this.showBenefitModal = false;
  }

  saveBenefit(): void {
    if (this.productId === null) return;

    if (!this.benefitForm.benefit_name?.trim()) {
      this.errorMessage = 'Please enter a benefit name.';
      return;
    }

    const payload = {
      ...this.benefitForm,
      product_id: this.productId,

      benefit_limit:
        this.benefitForm.benefit_limit === '' ||
        this.benefitForm.benefit_limit == null
          ? null
          : Number(this.benefitForm.benefit_limit)
    };

    const wasEditing = this.isEditingBenefit;

    this.isSaving = true;
    this.errorMessage = '';

    const request =
      wasEditing && this.editingBenefitId !== null
        ? this.ps.updateBenefit(this.editingBenefitId, payload)
        : this.ps.addBenefit(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.showBenefitModal = false;
        this.successMessage = wasEditing
          ? 'Benefit updated successfully.'
          : 'Benefit added successfully.';
        this.loadBenefits();
      },
      error: (err: any) => {
        console.error('Benefit save error:', err);
        this.isSaving = false;
        this.errorMessage =
          err.error?.message ??
          'Unable to save benefit. Check API authorization.';
      }
    });
  }

  deleteBenefit(id: number): void {
    if (!confirm('Are you sure you want to delete this benefit?')) {
      return;
    }

    this.ps.deleteBenefit(id).subscribe({
      next: () => {
        this.successMessage = 'Benefit deleted successfully.';
        this.loadBenefits();
      },
      error: (err: any) => {
        console.error('Benefit delete error:', err);
        this.errorMessage = 'Unable to delete benefit.';
      }
    });
  }

  // ==================================================
  // RIDER
  // ==================================================

  emptyRiderForm(): any {
    return {
      rider_name: '',
      rider_description: '',
      rider_premium: null,
      status: 'Active'
    };
  }

  loadRiders(): void {
    this.isLoadingRiders = true;

    this.ps.getRiders().subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res;

        this.riders = (Array.isArray(rows) ? rows : [])
          .filter(
            (r: any) =>
              Number(r.product_id) === this.productId
          );

        this.isLoadingRiders = false;
      },
      error: (err: any) => {
        console.error('Rider loading error:', err);
        this.isLoadingRiders = false;
      }
    });
  }

  openAddRider(): void {
    this.riderForm = this.emptyRiderForm();
    this.isEditingRider = false;
    this.editingRiderId = null;
    this.errorMessage = '';
    this.showRiderModal = true;
  }

  openEditRider(rider: any): void {
    this.riderForm = {
      rider_name: rider.rider_name ?? '',
      rider_description: rider.rider_description ?? '',
      rider_premium: rider.rider_premium ?? null,
      status: rider.status ?? 'Active'
    };

    this.isEditingRider = true;
    this.editingRiderId = rider.rider_id;
    this.errorMessage = '';
    this.showRiderModal = true;
  }

  closeRiderModal(): void {
    if (this.isSaving) return;
    this.showRiderModal = false;
  }

  saveRider(): void {
    if (this.productId === null) return;

    if (!this.riderForm.rider_name?.trim()) {
      this.errorMessage = 'Please enter a rider name.';
      return;
    }

    const payload = {
      ...this.riderForm,
      product_id: this.productId,
      rider_premium:
        this.riderForm.rider_premium === '' ||
        this.riderForm.rider_premium == null
          ? null
          : Number(this.riderForm.rider_premium)
    };

    const wasEditing = this.isEditingRider;

    this.isSaving = true;
    this.errorMessage = '';

    const request =
      wasEditing && this.editingRiderId !== null
        ? this.ps.updateRider(this.editingRiderId, payload)
        : this.ps.addRider(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.showRiderModal = false;
        this.successMessage = wasEditing
          ? 'Rider updated successfully.'
          : 'Rider added successfully.';
        this.loadRiders();
      },
      error: (err: any) => {
        console.error('Rider save error:', err);
        this.isSaving = false;
        this.errorMessage =
          err.error?.message ?? 'Unable to save rider.';
      }
    });
  }

  deleteRider(id: number): void {
    if (!confirm('Are you sure you want to deactivate this rider?')) {
      return;
    }

    this.ps.deleteRider(id).subscribe({
      next: () => {
        this.successMessage = 'Rider deactivated successfully.';
        this.loadRiders();
      },
      error: (err: any) => {
        console.error('Rider delete error:', err);
        this.errorMessage = 'Unable to deactivate rider.';
      }
    });
  }

  // ==================================================
  // PREMIUM FREQUENCY
  // ==================================================

  emptyFrequencyForm(): any {
    return {
      frequency_name: '',
      installment_count: null,
      status: 'Active'
    };
  }

  loadPremiumFrequencies(): void {
    this.isLoadingFrequencies = true;

    this.ps.getPremiumFrequencies().subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res;
        this.premiumFrequencies = Array.isArray(rows) ? rows : [];
        this.isLoadingFrequencies = false;
      },
      error: (err: any) => {
        console.error('Premium frequency loading error:', err);
        this.isLoadingFrequencies = false;
      }
    });
  }

  openAddFrequency(): void {
    this.frequencyForm = this.emptyFrequencyForm();
    this.isEditingFrequency = false;
    this.editingFrequencyId = null;
    this.errorMessage = '';
    this.showFrequencyModal = true;
  }

  openEditFrequency(frequency: any): void {
    this.frequencyForm = {
      frequency_name: frequency.frequency_name ?? '',
      installment_count: frequency.installment_count ?? null,
      status: frequency.status ?? 'Active'
    };

    this.isEditingFrequency = true;
    this.editingFrequencyId = frequency.frequency_id;
    this.errorMessage = '';
    this.showFrequencyModal = true;
  }

  closeFrequencyModal(): void {
    if (this.isSaving) return;
    this.showFrequencyModal = false;
  }

  saveFrequency(): void {
    if (!this.frequencyForm.frequency_name?.trim()) {
      this.errorMessage = 'Please enter a frequency name.';
      return;
    }

    const payload = {
      ...this.frequencyForm,
      installment_count:
        this.frequencyForm.installment_count === '' ||
        this.frequencyForm.installment_count == null
          ? null
          : Number(this.frequencyForm.installment_count)
    };

    const wasEditing = this.isEditingFrequency;

    this.isSaving = true;
    this.errorMessage = '';

    const request =
      wasEditing && this.editingFrequencyId !== null
        ? this.ps.updatePremiumFrequency(
            this.editingFrequencyId, payload
          )
        : this.ps.addPremiumFrequency(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.showFrequencyModal = false;
        this.successMessage = wasEditing
          ? 'Premium frequency updated successfully.'
          : 'Premium frequency added successfully.';
        this.loadPremiumFrequencies();
      },
      error: (err: any) => {
        console.error('Premium frequency save error:', err);
        this.isSaving = false;
        this.errorMessage =
          err.error?.message ??
          'Unable to save premium frequency. Admin access may be required.';
      }
    });
  }

  deleteFrequency(id: number): void {
    if (!confirm('Are you sure you want to deactivate this frequency?')) {
      return;
    }

    this.ps.deletePremiumFrequency(id).subscribe({
      next: () => {
        this.successMessage = 'Premium frequency deactivated successfully.';
        this.loadPremiumFrequencies();
      },
      error: (err: any) => {
        console.error('Premium frequency delete error:', err);
        this.errorMessage = 'Unable to deactivate premium frequency.';
      }
    });
  }

  // ==================================================
  // PRODUCT COMMISSION
  // ==================================================

  emptyCommissionForm(): any {
    return {
      first_year_commission: null,
      renewal_commission: null,
      branch_commission: null
    };
  }

  loadCommissions(): void {
    this.isLoadingCommissions = true;

    this.ps.getProductCommissions().subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res;

        this.commissions = (Array.isArray(rows) ? rows : [])
          .filter(
            (c: any) =>
              Number(c.product_id) === this.productId
          );

        this.isLoadingCommissions = false;
      },
      error: (err: any) => {
        console.error('Commission loading error:', err);
        this.isLoadingCommissions = false;
        this.errorMessage =
          'Unable to load commissions. Admin login is required.';
      }
    });
  }

  openAddCommission(): void {
    this.commissionForm = this.emptyCommissionForm();
    this.isEditingCommission = false;
    this.editingCommissionId = null;
    this.errorMessage = '';
    this.showCommissionModal = true;
  }

  openEditCommission(commission: any): void {
    this.commissionForm = {
      first_year_commission:
        commission.first_year_commission ?? null,
      renewal_commission:
        commission.renewal_commission ?? null,
      branch_commission:
        commission.branch_commission ?? null
    };

    this.isEditingCommission = true;
    this.editingCommissionId = commission.commission_id;
    this.errorMessage = '';
    this.showCommissionModal = true;
  }

  closeCommissionModal(): void {
    if (this.isSaving) return;
    this.showCommissionModal = false;
  }

  saveCommission(): void {
    if (this.productId === null) return;

    const fields = [
      this.commissionForm.first_year_commission,
      this.commissionForm.renewal_commission,
      this.commissionForm.branch_commission
    ];

    if (fields.some(v => v === '' || v == null || !Number.isFinite(Number(v)) || Number(v) < 0)) {
      this.errorMessage = 'Enter valid non-negative commission values.';
      return;
    }

    const payload = {
      ...this.commissionForm,
      product_id: this.productId,
      first_year_commission:
        Number(this.commissionForm.first_year_commission),
      renewal_commission:
        Number(this.commissionForm.renewal_commission),
      branch_commission:
        Number(this.commissionForm.branch_commission)
    };

    const wasEditing = this.isEditingCommission;

    this.isSaving = true;
    this.errorMessage = '';

    const request =
      wasEditing && this.editingCommissionId !== null
        ? this.ps.updateProductCommission(
            this.editingCommissionId, payload
          )
        : this.ps.addProductCommission(payload);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.showCommissionModal = false;
        this.successMessage = wasEditing
          ? 'Commission updated successfully.'
          : 'Commission added successfully.';
        this.loadCommissions();
      },
      error: (err: any) => {
        console.error('Commission save error:', err);
        this.isSaving = false;
        this.errorMessage =
          err.error?.message ??
          'Unable to save commission. Admin login is required.';
      }
    });
  }

  deleteCommission(id: number): void {
    if (!confirm('Are you sure you want to delete this commission?')) {
      return;
    }

    this.ps.deleteProductCommission(id).subscribe({
      next: () => {
        this.successMessage = 'Commission deleted successfully.';
        this.loadCommissions();
      },
      error: (err: any) => {
        console.error('Commission delete error:', err);
        this.errorMessage = 'Unable to delete commission.';
      }
    });
  }

  // ==================================================
  // PRODUCT / SUM INSURED / ACTIVATION
  // ==================================================

  loadProduct(): void {
    if (this.productId === null) return;

    this.ps.getProductById(this.productId).subscribe({
      next: (res: any) => {
        this.product = res?.data ?? res;

        this.sumInsuredForm = {
          minimum_sum_insured:
            this.product?.minimum_sum_insured ?? null,
          maximum_sum_insured:
            this.product?.maximum_sum_insured ?? null
        };

        this.activationStatus = this.product?.status ?? 'Active';
      },
      error: (err: any) => {
        console.error('Product loading error:', err);
        this.errorMessage = 'Unable to load product details.';
      }
    });
  }

  saveSumInsured(): void {
    if (!this.product || this.productId === null) return;

    const min = Number(this.sumInsuredForm.minimum_sum_insured);
    const max = Number(this.sumInsuredForm.maximum_sum_insured);

    if (
      this.sumInsuredForm.minimum_sum_insured == null ||
      this.sumInsuredForm.maximum_sum_insured == null ||
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      min < 0 ||
      max < min
    ) {
      this.errorMessage =
        'Enter valid amounts. Maximum must be at least the minimum.';
      return;
    }

    const payload = {
      ...this.product,
      minimum_sum_insured: min,
      maximum_sum_insured: max
    };

    this.isSaving = true;
    this.errorMessage = '';

    this.ps.UpdateProduct(this.productId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showSumInsuredModal = false;
        this.successMessage = 'Sum insured updated successfully.';
        this.loadProduct();
      },
      error: (err: any) => {
        console.error('Sum insured update error:', err);
        this.isSaving = false;
        this.errorMessage =
          err.error?.message ??
          'Unable to update sum insured.';
      }
    });
  }

  saveActivation(): void {
    if (!this.product || this.productId === null) return;

    const payload = {
      ...this.product,
      status: this.activationStatus
    };

    this.isSaving = true;
    this.errorMessage = '';

    this.ps.UpdateProduct(this.productId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showActivationModal = false;
        this.successMessage = 'Product status updated successfully.';
        this.loadProduct();
      },
      error: (err: any) => {
        console.error('Product activation error:', err);
        this.isSaving = false;
        this.errorMessage =
          err.error?.message ??
          'Unable to update product status.';
      }
    });
  }

  // ==================================================
  // NAVIGATION
  // ==================================================

  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}
