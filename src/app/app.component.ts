import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalStateService } from './services/global-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  loading$: Observable<boolean>;

  constructor(private _globalStateService: GlobalStateService) {
    this.loading$ = this._globalStateService.loading$;
  }
}
