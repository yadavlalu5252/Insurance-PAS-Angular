
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  private apiUrl = 'https://localhost:7122/api/v1/auth/login';

  login(username: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = {
      username: username,
      password: password
    };

    return this.http.post<LoginResponse>(this.apiUrl, request).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
      })
    );
  }
}
