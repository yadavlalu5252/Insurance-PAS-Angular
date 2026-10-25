import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy
} from '@angular/router';

@Injectable()
export class ReloadOnNavigationStrategy
  extends RouteReuseStrategy {

  shouldDetach(
    route: ActivatedRouteSnapshot
  ): boolean {
    return false;
  }

  store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle | null
  ): void {
    // Do not store detached components.
  }

  shouldAttach(
    route: ActivatedRouteSnapshot
  ): boolean {
    return false;
  }

  retrieve(
    route: ActivatedRouteSnapshot
  ): DetachedRouteHandle | null {
    return null;
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    current: ActivatedRouteSnapshot
  ): boolean {
    return false;
  }
}