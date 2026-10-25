
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);

  private readonly baseUrl = 'https://localhost:7201/api/v1/auth';

  // Login
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('access_token', response.accessToken);
          }
        })
      );
  }

  // Verify two-factor login
  verifyTwoFactorLogin(data: {
    challenge_token: string;
    code: string;
  }): Observable<unknown> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/2fa/verify-login`, data)
      .pipe(
        tap(response => {
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('access_token', response.accessToken);
          }
        })
      );
  }

  // Authorization headers for authenticated requests
  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('access_token') ||
      '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // Set up two-factor authentication
  setupTwoFactor(): Observable<unknown> {
    return this.http.post(
      `${this.baseUrl}/2fa/setup`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // Enable two-factor authentication
  enableTwoFactor(code: string): Observable<unknown> {
    return this.http.post(
      `${this.baseUrl}/2fa/enable`,
      { code },
      { headers: this.getAuthHeaders() }
    );
  }

register(data: { employee_id: number; username: string; password: string; email?: string; mobile?: string; role_id: number; branch_id: number }): Observable<string> {
  return this.http.post(`${this.baseUrl}/register`, data, { responseType: 'text' });
}

  // Forgot password
  forgotPassword(username: string): Observable<unknown> {
    return this.http.post(
      `${this.baseUrl}/forgot-password`,
      { username }
    );
  }

  // Refresh token
  refreshToken(refreshToken: string): Observable<unknown> {
    return this.http.post(
      `${this.baseUrl}/refresh-token`,
      { refresh_token: refreshToken }
    );
  }

  // Logout
  logout(): Observable<unknown> {
    return this.http.post(
      `${this.baseUrl}/logout`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('access_token');
      })
    );
  }
}
