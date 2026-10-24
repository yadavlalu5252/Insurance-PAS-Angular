
import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly baseUrl = 'https://localhost:7122/api/v1/auth';

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

verifyTwoFactorLogin(data: {
  challenge_token: string;
  code: string;
}) {
  return this.http.post(
    `${this.baseUrl}/2fa/verify-login`,
    data
  );
}



private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('access_token') || '';

  return new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
}

setupTwoFactor() {
  return this.http.post(
    `${this.baseUrl}/2fa/setup`,
    {},
    { headers: this.getAuthHeaders() }
  );
}

enableTwoFactor(code: string) {
  return this.http.post(
    `${this.baseUrl}/2fa/enable`,
    { code },
    { headers: this.getAuthHeaders() }
  );
}




  
  register(data: {
    employee_id: number;
    username: string;
    password: string;
    email?: string;
    mobile?: string;
    role_id: number;
    branch_id: number;
  }): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  forgotPassword(username: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { username });
  }

  refreshToken(refreshToken: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/refresh-token`, {
      refresh_token: refreshToken
    });
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/logout`, {});
  }
}
