
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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

  private readonly baseUrl = 'https://localhost:7201/api/v1/auth';

  constructor(private http: HttpClient) {}

  login(credentials: {
    username: string;
    password: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
        }
      })
    );
  }

  verifyTwoFactorLogin(data: {
    challenge_token: string;
    code: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/2fa/verify-login`,
      data
    ).pipe(
      tap(response => {
        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
        }
      })
  private http = inject(HttpClient);

  private readonly baseUrl = 'https://localhost:7122/api/v1/auth';

  login(username: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = {
      username,
      password
    };

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('access_token', response.accessToken); // Set both variants to support your 2FA methods
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

  register(data: {
    employee_id: number;
    username: string;
    password: string;
    email?: string;
    mobile?: string;
    role_id: number;
    branch_id: number;
  }): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/register`,
      data
    );
  }

  forgotPassword(username: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/forgot-password`,
      { username }
    );
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/refresh-token`,
      { refresh_token: refreshToken }
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/logout`,
      {}
    ).pipe(
      tap(() => {
        localStorage.removeItem('accessToken');
      })
    );
  }
}