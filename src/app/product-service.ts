
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  http = inject(HttpClient);

  private baseUrl = 'https://localhost:7129/api/v1';

  // Existing URLs
  url = `${this.baseUrl}/insurance-products`;
  categoryUrl = `${this.baseUrl}/product-categories`;
  coverageUrl = `${this.baseUrl}/coverages`;
  benefitUrl = `${this.baseUrl}/benefits`;

  // Additional configuration URLs
  riderUrl = `${this.baseUrl}/riders`;
  premiumFrequencyUrl = `${this.baseUrl}/premium-frequencies`;
  commissionUrl = `${this.baseUrl}/product-commissions`;

  // ==================== PRODUCT APIs ====================

  getProducts() {
    return this.http.get<any>(this.url);
  }

  getProductById(id: number) {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  AddProduct(data: any) {
    return this.http.post<any>(this.url, data);
  }

  UpdateProduct(id: number, data: any) {
    return this.http.put<any>(`${this.url}/${id}`, data);
  }

  DeleteProduct(id: number) {
    return this.http.delete<any>(`${this.url}/${id}`);
  }

  // ==================== CATEGORY APIs ====================

  getCategories() {
    return this.http.get<any>(this.categoryUrl);
  }

  getCategoryById(id: number) {
    return this.http.get<any>(`${this.categoryUrl}/${id}`);
  }

  AddCategory(data: any) {
    return this.http.post<any>(this.categoryUrl, data);
  }

  UpdateCategory(id: number, data: any) {
    return this.http.put<any>(`${this.categoryUrl}/${id}`, data);
  }

  DeleteCategory(id: number) {
    return this.http.delete<any>(`${this.categoryUrl}/${id}`);
  }

  // ==================== COVERAGE APIs ====================

  getCoverages() {
    return this.http.get<any>(this.coverageUrl);
  }

  getCoverageById(id: number) {
    return this.http.get<any>(`${this.coverageUrl}/${id}`);
  }

  addCoverage(data: any) {
    return this.http.post<any>(this.coverageUrl, data);
  }

  updateCoverage(id: number, data: any) {
    return this.http.put<any>(
      `${this.coverageUrl}/${id}`,
      data
    );
  }

  deleteCoverage(id: number) {
    return this.http.delete<any>(
      `${this.coverageUrl}/${id}`
    );
  }

  // ==================== BENEFIT APIs ====================

  getBenefits() {
    return this.http.get<any>(this.benefitUrl);
  }

  getBenefitById(id: number) {
    return this.http.get<any>(
      `${this.benefitUrl}/${id}`
    );
  }

  addBenefit(data: any) {
    return this.http.post<any>(this.benefitUrl, data);
  }

  updateBenefit(id: number, data: any) {
    return this.http.put<any>(
      `${this.benefitUrl}/${id}`,
      data
    );
  }

  deleteBenefit(id: number) {
    return this.http.delete<any>(
      `${this.benefitUrl}/${id}`
    );
  }

  // ==================== RIDER APIs ====================

  getRiders() {
    return this.http.get<any>(this.riderUrl);
  }

  getRiderById(id: number) {
    return this.http.get<any>(
      `${this.riderUrl}/${id}`
    );
  }

  addRider(data: any) {
    return this.http.post<any>(
      this.riderUrl,
      data
    );
  }

  updateRider(id: number, data: any) {
    return this.http.put<any>(
      `${this.riderUrl}/${id}`,
      data
    );
  }

  deleteRider(id: number) {
    return this.http.delete<any>(
      `${this.riderUrl}/${id}`
    );
  }

  // ==================== PREMIUM FREQUENCY APIs ====================

  getPremiumFrequencies() {
    return this.http.get<any>(
      this.premiumFrequencyUrl
    );
  }

  getPremiumFrequencyById(id: number) {
    return this.http.get<any>(
      `${this.premiumFrequencyUrl}/${id}`
    );
  }

  addPremiumFrequency(data: any) {
    return this.http.post<any>(
      this.premiumFrequencyUrl,
      data
    );
  }

  updatePremiumFrequency(id: number, data: any) {
    return this.http.put<any>(
      `${this.premiumFrequencyUrl}/${id}`,
      data
    );
  }

  deletePremiumFrequency(id: number) {
    return this.http.delete<any>(
      `${this.premiumFrequencyUrl}/${id}`
    );
  }

  // ==================== PRODUCT COMMISSION APIs ====================

  getProductCommissions() {
    return this.http.get<any>(
      this.commissionUrl
    );
  }

  getProductCommissionById(id: number) {
    return this.http.get<any>(
      `${this.commissionUrl}/${id}`
    );
  }

  addProductCommission(data: any) {
    return this.http.post<any>(
      this.commissionUrl,
      data
    );
  }

  updateProductCommission(id: number, data: any) {
    return this.http.put<any>(
      `${this.commissionUrl}/${id}`,
      data
    );
  }

  deleteProductCommission(id: number) {
    return this.http.delete<any>(
      `${this.commissionUrl}/${id}`
    );
  }
}
