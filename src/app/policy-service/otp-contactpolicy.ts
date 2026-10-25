import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OtpContactpolicy {
  http = inject(HttpClient);

  otpurl = "https://localhost:7130/api/v1/Otp/send-otp"
  sendOtp(email: string) {
    return this.http.post<any>(`${this.otpurl}?newEmail=${email}`, {});
  }
}
