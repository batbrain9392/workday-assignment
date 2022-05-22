import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  HostBinding,
} from '@angular/core';
import { DisplayData } from 'src/app/types';

@Component({
  selector: 'li[app-option]',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionComponent<T extends DisplayData> implements OnChanges {
  @Input() data?: T;
  @Input() selected?: boolean;

  @HostBinding('class.color-muted') get isEmptyOption(): boolean {
    return !this.data;
  }

  initials = ``;

  ngOnChanges(changes: SimpleChanges): void {
    if (`data` in changes && this.data) {
      const firstNameInitial = this.data.firstName.charAt(0);
      const lastNameInitial = this.data.lastName.charAt(0);
      this.initials = `${firstNameInitial}${lastNameInitial}`.toUpperCase();
    }
  }
}
