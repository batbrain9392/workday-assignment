# Manager Live Search

This project was created with React and TypeScript.

## Approach

### Data fetching and setup

Since the data seemed static, I decided to use the <i>fetch API</i> to fetch the data. There is a `loading` state and an `error` state shown in accordance with the fetching. I realise I could've used [React Query](https://react-query.tanstack.com/) for more efficiency, but not having much experience with it, I decided to play it safe with my custom fetch hook.

Upon fetching, the data is sorted by `name` and mapped to their `email` ids from the matching account data. It is then passed to the <b>SearchBox</b> component, ready for searching.

### Displaying the data with keyboard accessibility

The <b>SearchBox</b> component takes the full list as an argument and filters it based on the search term. It then maps the filtered list to the <b>Option</b> component, which displays the result. The list expands on receiving focus on the textbox and collapses on blur. It also opens on the textbox input. Upon expansion, the first element is always highlighted.

The <b>Option</b> component has been memoized to prevent unnecessary re-rendering, since it also generates the `initials` as well. If the input is empty, the all the options are shown. If the search has no matching items, a `No matching items` message is shown as an empty option. Or if the supplied list was empty to start with, a `List is empty` message is shown as an empty option.

If only up to 2 options are available, the list becomes non-scrollable and resizes itself accordingly. But for more, it hides the rest and the user can scroll through all with the help of `Arrow` keys. The in-focus option is always highlighted and ready for selection. Upon `Enter`, the highlighted option is selected, as in, the name of the manager is shown in the textbox while the list collapses.

#### Filtering the list on input

The <b>SearchBox</b> component initializes an inner list with the supplied array. The textbox sets the `searchTerm`, based on which the list is filtered. Since a user may type in a lot of characters, the list is <b>not</b> filtered on every keystroke, but debounced for `300ms`. Since the list re-renders on filter, the highlighted option is always updated accordingly with the first one being in focus.

The search term is case insensitive and ignores spaces too. So if the user types `SsE` and there is are 2 options like `Jesse Jackson` & `Jess Edwards`, both of them will be shortlisted. Process:

- the input term is converted to a regex by replacing spaces and ignoring case
- if the input term is empty, the list is not filtered
- else, the list is filtered by matching the names with the regex
- just before the matching, the name is stripped of spaces as well

#### Reusability of the SearchBox component

The <b>SearchBox</b> and the <b>Option</b> components have been made reusable with the help of Typescript Generics. They can work with any array of objects provided they have the following props at least:

```ts
{
  id: string,
  name: string,
  firstName: string,
  lastName: string,
  email: string,
}
```

The <b>SearchBox</b> component takes in the following arguments:

```ts
list: T[] // the list of items of aforementioned type
placeholder: string // to be shown in the textbox
listAriaLabel: string // for the list to be announced
```

## Unit tests

Since I have no experience with React unit tests, I omitted it for now; will add it later after going through some tutorials.

## Future (not in problem statement)

[ ] Make the SearchBox into a form-control element <br>
[ ] Add mouse interaction to list-items <br>
[ ] Allow access to <b>Option</b> component for custom styling <br>
[ ] Improve accessibility <br>
