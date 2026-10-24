import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../product-service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm implements OnInit {
  productId: number | null = null;
  isEdit = false;
  errorMessage = '';
  categories: any[] = [];

  constructor(
    private ps: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  productForm = new FormGroup({
    product_code: new FormControl('', Validators.required),
    product_name: new FormControl('', Validators.required),
    category_id: new FormControl('', Validators.required),
    product_type: new FormControl('', Validators.required),
    description: new FormControl(''),
    minimum_age: new FormControl(''),
    maximum_age: new FormControl(''),
    minimum_sum_insured: new FormControl(''),
    maximum_sum_insured: new FormControl(''),
    status: new FormControl('Active')
  });

  ngOnInit(): void {
    this.LoadCategories();

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id && !isNaN(id)) {
      this.productId = id;
      this.isEdit = true;
      this.GetProduct(id);
    }
  }

  LoadCategories(): void {
    this.ps.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data ?? res;
      },
      error: (err: any) => {
        console.error('Unable to load categories:', err);
        this.errorMessage = 'Unable to load categories.';
      }
    });
  }

    GetProduct(id: number): void {
    this.ps.getProductById(id).subscribe({
      next: (res: any) => {
        const product = res.data ?? res;
        this.productForm.patchValue({
          product_code: product.product_code,
          product_name: product.product_name,
          category_id: String(product.category_id ?? ''),
          product_type: product.product_type,
          description: product.description ?? '',
          minimum_age: String(product.minimum_age ?? ''),
          maximum_age: String(product.maximum_age ?? ''),
          minimum_sum_insured: String(product.minimum_sum_insured ?? ''),
          maximum_sum_insured: String(product.maximum_sum_insured ?? ''),
          status: product.status ?? 'Active'
        });
      },
      error: (err: any) => {
        console.error('Unable to load product:', err);
        this.errorMessage = 'Unable to load product details.';
      }
    });
  }


  SaveProduct(): void {
    this.errorMessage = '';

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required product details.';
      return;
    }

    const formData = this.productForm.getRawValue();

    const data = {
      ...formData,
      category_id: Number(formData.category_id),
      minimum_age: formData.minimum_age !== '' ? Number(formData.minimum_age) : null,
      maximum_age: formData.maximum_age !== '' ? Number(formData.maximum_age) : null,
      minimum_sum_insured: formData.minimum_sum_insured !== ''
        ? Number(formData.minimum_sum_insured)
        : null,
      maximum_sum_insured: formData.maximum_sum_insured !== ''
        ? Number(formData.maximum_sum_insured)
        : null
    };

    if (this.isEdit && this.productId) {
      this.ps.UpdateProduct(this.productId, data).subscribe({
        next: (res: any) => {
          alert(res.message ?? 'Product updated successfully.');
          this.router.navigate(['/products']);
        },
        error: (err: any) => {
          console.error('Unable to update product:', err);
          this.errorMessage = 'Unable to update product.';
        }
      });
    } else {
      this.ps.AddProduct(data).subscribe({
        next: (res: any) => {
          alert(res.message ?? 'Product added successfully.');
          this.router.navigate(['/products']);
        },
        error: (err: any) => {
          console.error('Unable to add product:', err);
          this.errorMessage = 'Unable to add product.';
        }
      });
    }
  }

  Cancel(): void {
    this.router.navigate(['/products']);
  }
}
