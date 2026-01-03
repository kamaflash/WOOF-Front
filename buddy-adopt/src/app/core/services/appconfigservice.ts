import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private transitionCompleteFlag = false;

  transitionComplete(): boolean {
    return this.transitionCompleteFlag;
  }

  setTransitionComplete(value: boolean): void {
    this.transitionCompleteFlag = value;
  }
}
