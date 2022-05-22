import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GetApiDataService } from './services';

const API_URL = `https://gist.githubusercontent.com/daviferreira/41238222ac31fe36348544ee1d4a9a5e/raw/5dc996407f6c9a6630bfcec56eee22d4bc54b518/employees.json`;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly data$ = this.getApiDataService.fetchManagerData(API_URL);

  constructor(private readonly getApiDataService: GetApiDataService) {}
}
