import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  HostBinding,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  merge,
  Observable,
} from 'rxjs';
import { DisplayData } from 'src/app/types';

export const RESET_SELECTED_OPTION_INDEX = -1;
export const DEBOUNCE_TIME = 300;
const removeSpaces = (value: string) => value.replace(/\s/g, '');

@UntilDestroy()
@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBoxComponent<T extends DisplayData>
  implements OnChanges, OnInit
{
  @Input() list: T[] = [];
  @Input() placeholder = '';
  @Input() listAriaLabel = '';

  readonly itemListId = 'itemList';

  @HostBinding('aria-owns') get ariaOwns() {
    return this.itemListId;
  }

  @ViewChild('listEl') listElRef?: ElementRef<HTMLUListElement>;

  readonly searchTermControl = new FormControl('');

  private readonly filteredList = new BehaviorSubject<T[]>([]);
  readonly filteredList$ = this.filteredList.asObservable();

  private readonly showList = new BehaviorSubject(false);
  readonly showList$ = this.showList.asObservable();

  private readonly selectedOptionIndex = new BehaviorSubject(
    RESET_SELECTED_OPTION_INDEX
  );
  readonly selectedOptionIndex$ = this.selectedOptionIndex.asObservable();

  readonly trackById = (_: number, { id }: T) => id;

  ngOnChanges(changes: SimpleChanges): void {
    if (`list` in changes) {
      this.filteredList.next(changes['list'].currentValue);
    }
  }

  ngOnInit(): void {
    merge(
      this.setSelectedOptionIndexOnExpand(),
      this.scrollsSelectedOptionIntoView(),
      this.filterResultsOnSearch()
    )
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  /**
   * Sets the first option as selected when the list opens with valid list items.
   * Resets the selected option index when the list closes or if the list is empty.
   */
  private setSelectedOptionIndexOnExpand(): Observable<void> {
    return combineLatest([this.showList$, this.filteredList$]).pipe(
      map(([showList, filteredList]) =>
        this.selectedOptionIndex.next(
          showList && filteredList.length ? 0 : RESET_SELECTED_OPTION_INDEX
        )
      )
    );
  }

  /**
   * Scrolls the selected option into view.
   * Skips when the list is empty.
   */
  private scrollsSelectedOptionIntoView(): Observable<void> {
    return this.selectedOptionIndex$.pipe(
      filter(
        (selectedOptionIndex) =>
          selectedOptionIndex !== RESET_SELECTED_OPTION_INDEX
      ),
      map((selectedOptionIndex) => {
        const ul = this.listElRef?.nativeElement;
        if (!ul) return;
        const { scrollTop, clientHeight } = ul;
        const selectedOptionEl = ul.children.item(selectedOptionIndex);
        if (!selectedOptionEl || !(selectedOptionEl instanceof HTMLLIElement))
          return;
        const { offsetTop, offsetHeight } = selectedOptionEl;
        const offsetBottom = offsetTop + offsetHeight;
        const scrollBottom = scrollTop + clientHeight;
        if (offsetTop < scrollTop) ul.scrollTop = offsetTop;
        else if (offsetBottom > scrollBottom)
          ul.scrollTop = offsetBottom - clientHeight;
      })
    );
  }

  /**
   * Filter the main list and set the displayed list for every search term change.
   * Function has been debounced to increase performance.
   */
  private filterResultsOnSearch(): Observable<void> {
    return this.searchTermControl.valueChanges.pipe(
      debounceTime(DEBOUNCE_TIME),
      distinctUntilChanged(),
      map((value: string) => {
        const valueWithNoSpaces = removeSpaces(value);
        if (!valueWithNoSpaces) {
          this.filteredList.next(this.list);
          return;
        }
        const searchRegex = new RegExp(valueWithNoSpaces, `i`);
        const data = this.list.filter(({ name }) =>
          removeSpaces(name).match(searchRegex)
        );
        this.filteredList.next(data);
      })
    );
  }

  expandList() {
    this.showList.next(true);
  }

  collapseList() {
    this.showList.next(false);
  }

  /**
   * Handles the keyboard events in the textbox.
   * Skips when the list is empty.
   * From the template, it is bound to 3 specific keys:
   * - `ArrowDown`: Highlight the next item in the list.
   * - `ArrowUp`: Highlight the previous item in the list.
   * - `Enter`: Set the selected option name in the textbox and close the list
   */
  textboxKeyDownHandler(event: Event): void {
    if (!this.showList.getValue() || !(event instanceof KeyboardEvent)) return;
    const selectedOptionIndex = this.selectedOptionIndex.getValue();
    const filteredList = this.filteredList.getValue();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (selectedOptionIndex === RESET_SELECTED_OPTION_INDEX) return;
        const nextIndex = (selectedOptionIndex + 1) % filteredList.length;
        this.selectedOptionIndex.next(nextIndex);
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (selectedOptionIndex === RESET_SELECTED_OPTION_INDEX) return;
        const previousIndex = (selectedOptionIndex || filteredList.length) - 1;
        this.selectedOptionIndex.next(previousIndex);
        return;
      default:
        event.preventDefault();
        this.showList.next(false);
        if (selectedOptionIndex === RESET_SELECTED_OPTION_INDEX) return;
        const result = filteredList[selectedOptionIndex].name;
        this.searchTermControl.setValue(result);
        return;
    }
  }
}
