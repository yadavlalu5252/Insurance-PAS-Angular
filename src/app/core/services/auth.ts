import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);

  private readonly baseUrl = 'https://localhost:7201/api/v1/auth';

  login(username: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = {
      username,
      password
    };

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
      })
    );
  }

  verifyTwoFactorLogin(data: {
    challenge_token: string;
    code: string;
  }): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/2fa/verify-login`, data);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  setupTwoFactor(): Observable<unknown> {
    return this.http.post(
      `${this.baseUrl}/2fa/setup`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

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