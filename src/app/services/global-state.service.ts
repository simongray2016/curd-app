import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalStateService {
  private loadingSubject$ = new BehaviorSubject<boolean>(false);

  get loading$(): Observable<boolean> {
    return this.loadingSubject$.asObservable();
  }

  constructor() {}

  setLoading(isLoading: boolean) {
    this.loadingSubject$.next(isLoading);
  }
}
