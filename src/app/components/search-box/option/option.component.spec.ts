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
