
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../product-service';

@Component({
  selector: 'app-category',
  imports: [CommonModule],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class Category implements OnInit {

  categories: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private ps: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.GetCategories();
  }

  GetCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ps.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data ?? res;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Category loading error:', err);
        this.errorMessage = 'Unable to load categories.';
        this.isLoading = false;
      }
    });
  }

  AddCategory(): void {
    this.router.navigate(['/categories/add']);
  }

  EditCategory(id: number): void {
    this.router.navigate(['/categories/edit', id]);
  }

  DeleteCategory(id: number): void {
    if (!confirm('Are you sure you want to deactivate this category?')) {
      return;
    }

    this.ps.DeleteCategory(id).subscribe({
      next: (res: any) => {
        this.successMessage =
          res.message ?? 'Category deactivated successfully.';
        this.GetCategories();
      },
      error: (err: any) => {
        console.error('Category deactivation error:', err);
        this.errorMessage = 'Unable to deactivate category.';
      }
    });
  }
}
