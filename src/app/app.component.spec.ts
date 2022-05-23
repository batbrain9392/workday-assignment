import { TestBed } from '@angular/core/testing';
import { provideAutoSpy } from 'jasmine-auto-spies';
import { AppComponent } from './app.component';
import { GetApiDataService } from './services';

describe('AppComponent', () => {
  let itemUnderTest: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppComponent, provideAutoSpy(GetApiDataService)],
    });
    itemUnderTest = TestBed.inject(AppComponent);
  });

  describe(`INIT`, () => {
    it('should be created', () => {
      expect(itemUnderTest).toBeTruthy();
    });
  });
});
