
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class QuoteService {
  http = inject(HttpClient);

  url = 'https://localhost:7260/api/Quote/GetAll';

  getQuotes() {
    return this.http.get<any>(this.url);
  }

  url2 = 'https://localhost:7260/api/Quote/Get';

  getQuoteById(id: number) {
    return this.http.get<any>(`${this.url2}/${id}`);
  }

  url3 = 'https://localhost:7260/api/Quote/Create';

  AddQuote(data: any) {
    return this.http.post<any>(this.url3, data);
  }

  url4 = 'https://localhost:7260/api/PremiumCalculation/Calculate';

  CalculatePremium(quoteId: number) {
    return this.http.post<any>(`${this.url4}/${quoteId}`, {});
  }

  url5 = 'https://localhost:7260/api/PremiumCalculation/GetByQuoteId';

  GetPremiumByQuoteId(quoteId: number) {
    return this.http.get<any>(`${this.url5}/${quoteId}`);
  }
}
