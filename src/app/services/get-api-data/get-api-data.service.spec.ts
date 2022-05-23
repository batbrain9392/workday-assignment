import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideAutoSpy, Spy } from 'jasmine-auto-spies';
import { subscribeSpyTo } from '@hirez_io/observer-spy';

import { GetApiDataService } from './get-api-data.service';
import {
  Account,
  APIResponse,
  DisplayData,
  Employee,
  EntityType,
} from 'src/app/types';

const generateEmployee = (num: number): Employee =>
  ({
    id: `fake id ${num}`,
    type: EntityType.Employees,
    attributes: {
      name: `fake name ${num}`,
      firstName: `fake firstName ${num}`,
      lastName: `fake lastName ${num}`,
    },
    relationships: {
      account: {
        data: {
          id: `fake account id ${num}`,
        },
      },
    },
  } as Employee);

const generateAccount = ({ id, relationships }: Employee): Account =>
  ({
    id: relationships.account.data.id,
    type: EntityType.Accounts,
    attributes: { email: `email for ${id}` },
  } as Account);

describe('GetApiDataService', () => {
  let itemUnderTest: GetApiDataService;
  let http: Spy<HttpClient>;

  let validAPIResponse: APIResponse;
  let employee1: Employee;
  let employee2: Employee;
  let account1: Account;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GetApiDataService, provideAutoSpy(HttpClient)],
    });
    itemUnderTest = TestBed.inject(GetApiDataService);
    http = TestBed.inject<any>(HttpClient);
  });

  beforeEach(() => {
    employee1 = generateEmployee(1);
    employee2 = generateEmployee(2);
    account1 = generateAccount(employee1);
    validAPIResponse = {
      data: [employee1, employee2],
      included: [account1],
    } as APIResponse;
  });

  describe(`INIT`, () => {
    it(`should be created`, () => {
      expect(itemUnderTest).toBeTruthy();
    });
  });

  describe(`METHOD: fetchManagerData`, () => {
    const url = `fake url`;
    it(`should return an the ready for display data for a successful fetch`, () => {
      http.get.mustBeCalledWith(url).nextOneTimeWith(validAPIResponse);
      const spy = subscribeSpyTo(itemUnderTest.fetchManagerData(url));
      const result = spy.getLastValue();
      const expectedResult: DisplayData[] = [
        {
          id: employee1.id,
          name: employee1.attributes.name,
          email: account1.attributes.email,
          firstName: employee1.attributes.firstName,
          lastName: employee1.attributes.lastName,
        },
        {
          id: employee2.id,
          name: employee2.attributes.name,
          email: ``,
          firstName: employee2.attributes.firstName,
          lastName: employee2.attributes.lastName,
        },
      ];
      expect(result?.data).toEqual(expectedResult);
      expect(result?.error).toBeFalsy();
    });
    it(`should return an empty data with the error for an unsuccessful fetch`, () => {
      const errorMsg = `fake error`;
      http.get.mustBeCalledWith(url).throwWith(new Error(errorMsg));
      const spy = subscribeSpyTo(itemUnderTest.fetchManagerData(url));
      const result = spy.getLastValue();
      expect(result?.data).toEqual([]);
      expect(result?.error).toBe(errorMsg);
    });
  });
});
