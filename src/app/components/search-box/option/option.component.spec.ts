import { SimpleChange } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DisplayData } from 'src/app/types';
import { OptionComponent } from './option.component';

describe('OptionComponent', () => {
  let itemUnderTest: OptionComponent<DisplayData>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OptionComponent],
    });
    itemUnderTest = TestBed.inject(OptionComponent);
  });

  describe(`INIT`, () => {
    it(`should be created`, () => {
      expect(itemUnderTest).toBeTruthy();
    });
  });

  describe(`PROPERTY: isEmptyOption`, () => {
    it(`should return false if data has been provided`, () => {
      itemUnderTest.data = { id: `fake id` } as DisplayData;
      expect(itemUnderTest.isEmptyOption).toBe(false);
    });
    it(`should return true if data has not been provided`, () => {
      itemUnderTest.data = undefined;
      expect(itemUnderTest.isEmptyOption).toBe(true);
    });
  });

  describe(`LIFE-CYCLE: ngOnChanges`, () => {
    it(`should set the initials when data is received`, () => {
      const validData = {
        firstName: `John`,
        lastName: `Doe`,
      } as DisplayData;
      itemUnderTest.ngOnChanges({
        data: new SimpleChange(undefined, validData, true),
      });
      expect(itemUnderTest.initials).toBe(`JD`);
    });
  });
});
