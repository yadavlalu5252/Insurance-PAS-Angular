
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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
