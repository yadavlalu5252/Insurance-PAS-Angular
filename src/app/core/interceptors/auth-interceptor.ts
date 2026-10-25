import { HttpInterceptorFn } from '@angular/common/http';

// the Authentication API and the Claim API
const apiUrls = ['https://localhost:7122/api/', 'https://localhost:7130/api/'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');

  if (token && apiUrls.some((url) => req.url.startsWith(url))) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  }

  return next(req);
};