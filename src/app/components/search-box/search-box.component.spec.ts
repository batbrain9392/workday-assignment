import { ElementRef, SimpleChange } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { EMPTY } from 'rxjs';

import {
  DEBOUNCE_TIME,
  RESET_SELECTED_OPTION_INDEX,
  SearchBoxComponent,
} from './search-box.component';
import { DisplayData } from 'src/app/types';
import { createSpyFromClass, Spy } from 'jasmine-auto-spies';

describe('SearchBoxComponent', () => {
  let itemUnderTest: SearchBoxComponent<DisplayData>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchBoxComponent],
    });
    itemUnderTest = TestBed.inject(SearchBoxComponent);
  });

  describe(`INIT`, () => {
    it('should be created', () => {
      expect(itemUnderTest).toBeTruthy();
    });
  });

  describe(`PROPERTY: ariaOwns`, () => {
    it(`should return itemListId`, () => {
      expect(itemUnderTest.ariaOwns).toBe(itemUnderTest.itemListId);
    });
  });

  describe(`PROPERTY: trackById`, () => {
    it(`should return the id`, () => {
      const id = 'fake id';
      expect(itemUnderTest.trackById(0, { id } as DisplayData)).toBe(id);
    });
  });

  describe(`LIFE-CYCLE: ngOnChanges`, () => {
    it(`should set the initials when data is received`, () => {
      const list = [
        {
          firstName: `John`,
          lastName: `Doe`,
        },
      ] as DisplayData[];
      itemUnderTest.ngOnChanges({
        list: new SimpleChange(undefined, list, true),
      });
      const result = subscribeSpyTo(itemUnderTest.filteredList$).getLastValue();
      expect(result).toEqual(list);
    });
  });

  describe(`LIFE-CYCLE: ngOnInit`, () => {
    beforeEach(() => {
      spyOn<any>(
        itemUnderTest,
        `setSelectedOptionIndexOnExpand`
      ).and.returnValue(EMPTY);
      spyOn<any>(
        itemUnderTest,
        `scrollsSelectedOptionIntoView`
      ).and.returnValue(EMPTY);
      spyOn<any>(itemUnderTest, `filterResultsOnSearch`).and.returnValue(EMPTY);
    });
    it(`should setup the listeners`, fakeAsync(() => {
      itemUnderTest.ngOnInit();
      flush();
      expect(
        itemUnderTest[`setSelectedOptionIndexOnExpand`]
      ).toHaveBeenCalled();
      expect(itemUnderTest[`scrollsSelectedOptionIntoView`]).toHaveBeenCalled();
      expect(itemUnderTest[`filterResultsOnSearch`]).toHaveBeenCalled();
    }));
  });

  describe(`METHOD: setSelectedOptionIndexOnExpand`, () => {
    let list: DisplayData[];
    beforeEach(() => {
      list = [
        {
          firstName: `John`,
          lastName: `Doe`,
        },
      ] as DisplayData[];
    });
    it(`should set the selected option index to 0 on expansion when the list has data`, () => {
      itemUnderTest['filteredList'].next(list);
      itemUnderTest['showList'].next(true);
      subscribeSpyTo(itemUnderTest[`setSelectedOptionIndexOnExpand`]());
      const result = subscribeSpyTo(
        itemUnderTest.selectedOptionIndex$
      ).getLastValue();
      expect(result).toBe(0);
    });
    it(`should reset the selected option index on collapse`, () => {
      itemUnderTest['filteredList'].next(list);
      itemUnderTest['showList'].next(false);
      subscribeSpyTo(itemUnderTest[`setSelectedOptionIndexOnExpand`]());
      const result = subscribeSpyTo(
        itemUnderTest.selectedOptionIndex$
      ).getLastValue();
      expect(result).toBe(RESET_SELECTED_OPTION_INDEX);
    });
    it(`should reset the selected option index if the list has no data`, () => {
      itemUnderTest['filteredList'].next([]);
      itemUnderTest['showList'].next(true);
      subscribeSpyTo(itemUnderTest[`setSelectedOptionIndexOnExpand`]());
      const result = subscribeSpyTo(
        itemUnderTest.selectedOptionIndex$
      ).getLastValue();
      expect(result).toBe(RESET_SELECTED_OPTION_INDEX);
    });
  });

  describe(`METHOD: scrollsSelectedOptionIntoView`, () => {
    const liHeight = 100;
    const createLIItems = (num: number) => {
      const liItems = [];
      for (let i = 0; i < num; i++) {
        const li = document.createElement(`li`);
        Object.defineProperty(li, `offsetTop`, { value: i * liHeight });
        Object.defineProperty(li, `offsetHeight`, { value: liHeight });
        liItems.push(li);
      }
      return liItems;
    };
    let li0: HTMLLIElement;
    let li1: HTMLLIElement;
    let li2: HTMLLIElement;
    let children: Spy<HTMLCollection>;
    let ul: Spy<HTMLUListElement>;
    beforeEach(() => {
      [li0, li1, li2] = createLIItems(3);
      children = createSpyFromClass(HTMLCollection);
      children.item.calledWith(0).returnValue(li0);
      children.item.calledWith(1).returnValue(li1);
      children.item.calledWith(2).returnValue(li2);
      ul = createSpyFromClass(HTMLUListElement, {
        gettersToSpyOn: [`children`, `clientHeight`],
      });
      ul.accessorSpies.getters.children.and.returnValue(children);
      ul.scrollTop = 0;
      ul.accessorSpies.getters.clientHeight.and.returnValue(liHeight * 2);
      const listElRef = createSpyFromClass<ElementRef<HTMLUListElement>>(
        ElementRef,
        { gettersToSpyOn: [`nativeElement`] }
      );
      listElRef.accessorSpies.getters.nativeElement.and.returnValue(ul);
      itemUnderTest.listElRef = listElRef;
    });
    it(`should set skip if the selected index were reset`, async () => {
      itemUnderTest[`selectedOptionIndex`].next(RESET_SELECTED_OPTION_INDEX);
      subscribeSpyTo(itemUnderTest[`scrollsSelectedOptionIntoView`]());
      expect(children.item).not.toHaveBeenCalled();
    });
    it(`should not scroll if the first item is focussed`, () => {
      itemUnderTest[`selectedOptionIndex`].next(0);
      subscribeSpyTo(itemUnderTest[`scrollsSelectedOptionIntoView`]());
      expect(ul.scrollTop).toBe(0);
    });
    it(`should not scroll if the second item is focussed because the height of the list is up to 2 items`, () => {
      itemUnderTest[`selectedOptionIndex`].next(1);
      subscribeSpyTo(itemUnderTest[`scrollsSelectedOptionIntoView`]());
      expect(ul.scrollTop).toBe(0);
    });
    it(`should scroll 1 option down to view the 3rd one when focussed`, () => {
      itemUnderTest[`selectedOptionIndex`].next(2);
      subscribeSpyTo(itemUnderTest[`scrollsSelectedOptionIntoView`]());
      expect(ul.scrollTop).toBe(li2.offsetHeight);
    });
    it(`should scroll the the first option after it reaches the end of the list`, () => {
      ul.scrollTop = li2.offsetHeight;
      itemUnderTest[`selectedOptionIndex`].next(0);
      subscribeSpyTo(itemUnderTest[`scrollsSelectedOptionIntoView`]());
      expect(ul.scrollTop).toBe(0);
    });
  });

  describe(`METHOD: filterResultsOnSearch`, () => {
    let list: DisplayData[];
    beforeEach(() => {
      list = [
        { name: `John Doe` },
        { name: `Logan Doe` },
        { name: `John Hancock` },
      ] as DisplayData[];
      itemUnderTest.list = list;
      itemUnderTest['filteredList'].next(list);
    });
    it(`should filter the list according to the given search term`, fakeAsync(() => {
      subscribeSpyTo(itemUnderTest[`filterResultsOnSearch`]());
      itemUnderTest.searchTermControl.setValue(`John`);
      tick(DEBOUNCE_TIME * 2);
      const result = subscribeSpyTo(itemUnderTest.filteredList$).getLastValue();
      expect(result).toEqual([list[0], list[2]]);
    }));
    it(`should ignore spaces in the given search term`, fakeAsync(() => {
      subscribeSpyTo(itemUnderTest[`filterResultsOnSearch`]());
      itemUnderTest.searchTermControl.setValue(`NdO`);
      tick(DEBOUNCE_TIME * 2);
      const result = subscribeSpyTo(itemUnderTest.filteredList$).getLastValue();
      expect(result).toEqual([list[0], list[1]]);
    }));
    it(`should set an empty list if the search does not match anything`, fakeAsync(() => {
      subscribeSpyTo(itemUnderTest[`filterResultsOnSearch`]());
      itemUnderTest.searchTermControl.setValue(`invalid input`);
      tick(DEBOUNCE_TIME * 2);
      const result = subscribeSpyTo(itemUnderTest.filteredList$).getLastValue();
      expect(result).toEqual([]);
    }));
    it(`should set the original list if the search term is blank-ish`, fakeAsync(() => {
      subscribeSpyTo(itemUnderTest[`filterResultsOnSearch`]());
      itemUnderTest.searchTermControl.setValue(`     `);
      tick(DEBOUNCE_TIME * 2);
      const result = subscribeSpyTo(itemUnderTest.filteredList$).getLastValue();
      expect(result).toEqual(list);
    }));
  });

  describe(`METHOD: expandList`, () => {
    it(`should set the list expanded to true`, () => {
      itemUnderTest.collapseList();
      itemUnderTest.expandList();
      const result = subscribeSpyTo(itemUnderTest.showList$).getLastValue();
      expect(result).toBe(true);
    });
  });

  describe(`METHOD: collapseList`, () => {
    it(`should set the list expanded to false`, () => {
      itemUnderTest.expandList();
      itemUnderTest.collapseList();
      const result = subscribeSpyTo(itemUnderTest.showList$).getLastValue();
      expect(result).toBe(false);
    });
  });

  describe(`METHOD: textboxKeyDownHandler`, () => {
    describe(`CONDITION: list is visible and the valid keyboard event has occurred`, () => {
      let list: DisplayData[];
      let event: KeyboardEvent;
      beforeEach(() => {
        list = [
          { name: `John Doe` },
          { name: `Logan Doe` },
          { name: `John Hancock` },
        ] as DisplayData[];
        itemUnderTest[`showList`].next(true);
        itemUnderTest['filteredList'].next(list);
      });
      describe(`CONDITION: arrow down`, () => {
        beforeEach(() => {
          event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
          spyOn(event, 'preventDefault').and.callThrough();
        });
        it(`should not do anything if there are no options`, () => {
          itemUnderTest['selectedOptionIndex'].next(
            RESET_SELECTED_OPTION_INDEX
          );
          itemUnderTest[`textboxKeyDownHandler`](event);
          const result = subscribeSpyTo(
            itemUnderTest.selectedOptionIndex$
          ).getLastValue();
          expect(result).toBe(RESET_SELECTED_OPTION_INDEX);
        });
        it(`should select the next option on key press`, () => {
          itemUnderTest['selectedOptionIndex'].next(0);
          itemUnderTest[`textboxKeyDownHandler`](event);
          const result = subscribeSpyTo(
            itemUnderTest.selectedOptionIndex$
          ).getLastValue();
          expect(result).toBe(1);
        });
        it(`should select the first option if the last option is in focus`, () => {
          itemUnderTest['selectedOptionIndex'].next(list.length - 1);
          itemUnderTest[`textboxKeyDownHandler`](event);
          const result = subscribeSpyTo(
            itemUnderTest.selectedOptionIndex$
          ).getLastValue();
          expect(result).toBe(0);
        });
      });
      describe(`CONDITION: arrow down`, () => {
        beforeEach(() => {
          event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
          spyOn(event, 'preventDefault').and.callThrough();
        });
        it(`should not do anything if there are no options`, () => {
          itemUnderTest['selectedOptionIndex'].next(
            RESET_SELECTED_OPTION_INDEX
          );
          itemUnderTest[`textboxKeyDownHandler`](event);
          const result = subscribeSpyTo(
            itemUnderTest.selectedOptionIndex$
          ).getLastValue();
          expect(result).toBe(RESET_SELECTED_OPTION_INDEX);
        });
        it(`should select the previous option on key press`, () => {
          itemUnderTest['selectedOptionIndex'].next(1);
          itemUnderTest[`textboxKeyDownHandler`](event);
          const result = subscribeSpyTo(
            itemUnderTest.selectedOptionIndex$
          ).getLastValue();
          expect(result).toBe(0);
        });
        it(`should select the last option if the first option is in focus`, () => {
          itemUnderTest['selectedOptionIndex'].next(0);
          itemUnderTest[`textboxKeyDownHandler`](event);
          const result = subscribeSpyTo(
            itemUnderTest.selectedOptionIndex$
          ).getLastValue();
          expect(result).toBe(list.length - 1);
        });
      });
      describe(`CONDITION: enter`, () => {
        beforeEach(() => {
          event = new KeyboardEvent('keydown', { key: 'Enter' });
          spyOn(event, 'preventDefault').and.callThrough();
        });
        it(`should close the list on key press`, () => {
          itemUnderTest[`textboxKeyDownHandler`](event);
          const result = subscribeSpyTo(itemUnderTest.showList$).getLastValue();
          expect(result).toBe(false);
        });
        it(`should set the textbox value with the selected option`, () => {
          const selectedOptionIndex = 1;
          itemUnderTest.searchTermControl.setValue(``);
          itemUnderTest['selectedOptionIndex'].next(selectedOptionIndex);
          itemUnderTest[`textboxKeyDownHandler`](event);
          expect(itemUnderTest.searchTermControl.value).toBe(
            list[selectedOptionIndex].name
          );
        });
        it(`should not set the textbox value if there is no selected option`, () => {
          itemUnderTest.searchTermControl.setValue(``);
          itemUnderTest['selectedOptionIndex'].next(
            RESET_SELECTED_OPTION_INDEX
          );
          itemUnderTest[`textboxKeyDownHandler`](event);
          expect(itemUnderTest.searchTermControl.value).toBeFalsy();
        });
      });
    });
  });
});
