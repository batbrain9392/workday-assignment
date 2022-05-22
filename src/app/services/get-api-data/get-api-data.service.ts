import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIResponse, DisplayData, isAccount } from 'src/app/types';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetApiDataService {
  constructor(private readonly http: HttpClient) {}

  fetchManagerData(
    url: string
  ): Observable<{ data: DisplayData[]; error: string }> {
    return this.http.get<APIResponse>(url).pipe(
      map((data) => ({
        data: this.convertToManagerDisplayData(data),
        error: ``,
      })),
      catchError((error: Error) => {
        return of({
          data: [],
          error: error.message,
        });
      })
    );
  }

  /**
   * Sorts the data by name and maps their emails from the matching account.
   */
  private convertToManagerDisplayData({
    data,
    included,
  }: APIResponse): DisplayData[] {
    const accounts = included.filter(isAccount);
    return data
      .sort((a, b) => a.attributes.name.localeCompare(b.attributes.name))
      .map(
        ({ id, attributes: { firstName, lastName, name }, relationships }) => {
          const email =
            accounts.find(({ id }) => id === relationships.account.data.id)
              ?.attributes.email ?? ``;
          return {
            id,
            name,
            firstName,
            lastName,
            email,
          };
        }
      );
  }
}
