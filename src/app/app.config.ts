import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import {
  provideRouter,
  withRouterConfig,
  RouteReuseStrategy
} from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { routes } from './app.routes';
import { ReloadOnNavigationStrategy } from './reload-on-navigation.strategy';
import { authInterceptor } from './core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    ),

    {
      provide: RouteReuseStrategy,
      useClass: ReloadOnNavigationStrategy
    },

    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};