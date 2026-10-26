import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  role_name?: string;
  roleName?: string;
  role?: string;
  requires_two_factor?: boolean;
  requires_two_factor_setup?: boolean;
  challenge_token?: string;
  login?: LoginResponse;
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
          const loginData = response.login ?? response;

          // Do not save an access token before 2FA verification.
          if (
            loginData.requires_two_factor === true &&
            loginData.challenge_token
          ) {
            return;
          }

          const accessToken =
            loginData.access_token ?? loginData.accessToken;

          const refreshToken =
            loginData.refresh_token ?? loginData.refreshToken;

          const role =
            loginData.role_name ??
            loginData.roleName ??
            loginData.role;

          if (accessToken) {
            this.saveAccessToken(accessToken);
          }

          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }

          if (role) {
            localStorage.setItem('role_name', String(role));
          }
        })
      );
  }

  // Verify two-factor login
  verifyTwoFactorLogin(data: {
    challenge_token: string;
    code: string;
  }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.baseUrl}/2fa/verify-login`,
        data
      )
      .pipe(
        tap(response => {
          const loginData = response.login ?? response;

          const accessToken =
            loginData.access_token ?? loginData.accessToken;

          const refreshToken =
            loginData.refresh_token ?? loginData.refreshToken;

          const role =
            loginData.role_name ??
            loginData.roleName ??
            loginData.role;

          if (accessToken) {
            this.saveAccessToken(accessToken);
          }

          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }

          if (role) {
            localStorage.setItem('role_name', String(role));
          }
        })
      );
  }

  // Save access token using consistent storage keys
  private saveAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('accessToken', token);
  }

  // Authorization headers for authenticated requests
  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('accessToken') ||
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

  // Register
  register(data: {
    employee_id: number;
    username: string;
    password: string;
    email?: string;
    mobile?: string;
    role_id: number;
    branch_id: number;
  }): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/register`,
      data,
      { responseType: 'text' }
    );
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
    return this.http
      .post(
        `${this.baseUrl}/logout`,
        {},
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        tap(() => {
          this.clearAuthentication();
        })
      );
  }

  // Clear authentication details
  clearAuthentication(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role_name');
  }
}
