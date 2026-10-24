
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../product-service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss'
})
export class CategoryForm implements OnInit {

  categoryId: number | null = null;
  isEdit = false;
  errorMessage = '';
  isSaving = false;

  categoryForm = new FormGroup({
    category_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)]
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(255)]
    }),
    status: new FormControl('Active', {
      nonNullable: true
    })
  });

  constructor(
    private ps: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      this.categoryId = id;
      this.isEdit = true;
      this.GetCategory(id);
    }
  }

  GetCategory(id: number): void {
    this.ps.getCategoryById(id).subscribe({
      next: (res: any) => {
        const category = res.data ?? res;

        this.categoryForm.patchValue({
          category_name: category.category_name ?? '',
          description: category.description ?? '',
          status: category.status ?? 'Active'
        });
      },
      error: (err: any) => {
        console.error('Category loading error:', err);
        this.errorMessage = 'Unable to load category details.';
      }
    });
  }

  SaveCategory(): void {
    this.errorMessage = '';

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const data = {
      ...this.categoryForm.getRawValue()
    };

    const request = this.isEdit && this.categoryId !== null
      ? this.ps.UpdateCategory(this.categoryId, {
          ...data,
          category_id: this.categoryId
        })
      : this.ps.AddCategory(data);

    request.subscribe({
      next: (res: any) => {
        this.isSaving = false;
        this.router.navigate(['/categories']);
      },
      error: (err: any) => {
        console.error('Category save error:', err);
        this.isSaving = false;
        this.errorMessage =
          err.error?.message ?? 'Unable to save category. Please try again.';
      }
    });
  }

  Cancel(): void {
    this.router.navigate(['/categories']);
  }
}
