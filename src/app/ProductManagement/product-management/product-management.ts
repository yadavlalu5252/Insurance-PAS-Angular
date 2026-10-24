
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-management.html',
  styleUrl: './product-management.scss'
})
export class ProductManagement {

  constructor(private router: Router) {}

  openCategories(): void {
    this.router.navigate(['/categories']);
  }

  openProducts(): void {
    this.router.navigate(['/products']);
  }

  openConfiguration(): void {
    this.router.navigate(['/product-configuration']);
  }
}
