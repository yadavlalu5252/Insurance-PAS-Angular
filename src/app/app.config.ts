// import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { routes } from './app.routes';
// import { provideHttpClient } from '@angular/common/http';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideRouter(routes),
//      provideHttpClient()
//   ]
// };

import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  withRouterConfig,
  RouteReuseStrategy
} from '@angular/router';

import { routes } from './app.routes';
import { ReloadOnNavigationStrategy } from './reload-on-navigation.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
        
      })
    ),

    {
      provide: RouteReuseStrategy,
      useClass: ReloadOnNavigationStrategy
    }
  ]
};
