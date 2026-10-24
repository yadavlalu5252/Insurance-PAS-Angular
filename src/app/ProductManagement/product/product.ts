
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../product-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [CommonModule],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class Product {

  products: any[] = [];
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private ps: ProductService, private router: Router) {}

  ngOnInit() {
    this.GetProducts();
  }
  AddProduct() {
  this.router.navigate(['/products/add']);
}

EditProduct(id: number) {
  this.router.navigate(['/products/edit', id]);
}

  GetProducts() {
    this.isLoading = true;
    this.errorMessage = '';

    this.ps.getProducts().subscribe({
      next: (res: any) => {
        this.products = res.data ?? res;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = 'Unable to load products. Please check the API.';
        this.isLoading = false;
      }
    });
  }
  
ConfigureProduct(id: number): void {
  this.router.navigate(['/product-configuration', id]);
}


  DeleteProduct(id: number) {
    if (confirm('Are you sure you want to deactivate this product?')) {
      this.ps.DeleteProduct(id).subscribe({
        next: (res: any) => {
          this.successMessage = 'Product deactivated successfully.';
          this.GetProducts();
        },
        error: (err: any) => {
          console.error(err);
          this.errorMessage = 'Unable to deactivate product.';
        }
      });
    }
  }
}
