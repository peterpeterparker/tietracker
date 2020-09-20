<a name="1.4.0"></a>

# 1.4.0 (2020-09-20)

### Features

- backup on demand ([#80](https://github.com/peterpeterparker/tietracker/issues/80))
- display the total of the open invoices ([#81](https://github.com/peterpeterparker/tietracker/issues/81))
- add the summary to the stats tab

### Fix

- excel export "duration" column references in case of backup

<a name="1.3.0"></a>

# 1.3.0 (2020-09-01)

### Features

- feat: display total billable hours on export modal ([#77](https://github.com/peterpeterparker/tietracker/issues/77))
- update dependencies

<a name="1.2.1"></a>

# 1.2.1 (2020-05-24)

### Features

- update for Native File System API V2 trial

<a name="1.2.0"></a>

# 1.2.0 (2020-05-23)

### Features

- introduces budget for projects ([#63](https://github.com/peterpeterparker/tietracker/issues/63))
- deprecated saveFile should be replaced with save-file ([#71](https://github.com/peterpeterparker/tietracker/issues/71))
- update dependencies
- update Capacitor 2.0 and Android Studio 3.6
- use prettier to format code

#### Release Notes

The new optional budget is based, for performance reason, on a counter.
That is why, if you wish to use it for your ongoing projects, you have to enter once manually what has been charged so far for the selected project.
For new project, this is going to be calculated automatically each time you are going to bill your projects.

Both "budget" and "already billed" find places in the project details, accessible through the client details.

<a name="1.1.2"></a>

# 1.1.2 (2020-03-16)

### Fix

- duration rows references in case of multiple days to invoice (export)
- columns references to calculate duration for backup

<a name="1.1.1"></a>

# 1.1.1 (2020-03-16)

### Fix

- duration doesn't amend rows in excel export

<a name="1.1.0"></a>

# 1.1.0 (2020-03-10)

### Features

- display overall today worked time when task in progress
- move summary back to main screen

### Fix

- charts rerender

<a name="1.0.0"></a>

# 1.0.0 (2020-03-09)

### Features

- weekly chart breakdown ([#56](https://github.com/peterpeterparker/tietracker/issues/56))
- excel export round total ([#55](https://github.com/peterpeterparker/tietracker/issues/55))

### Fix

- weekly backup detection ([#61](https://github.com/peterpeterparker/tietracker/pull/61))
- excel export time rounding ([#57](https://github.com/peterpeterparker/tietracker/issues/57))

<a name="0.7.2"></a>

# 0.7.2 (2020-02-24)

### Features

- ask for a backup as soon as one entry has been registered
- backup only open entries

### Fix

- remove event listener for input focus
- defer backup modal for mobile

<a name="0.7.1"></a>

# 0.7.1 (2020-02-18)

### Features

- update dependencies, Ionic and Ionicons v5 ([338394c](https://github.com/peterpeterparker/tietracker/commit/338394c7653ec8e06a984fab571d5acd5ebd4e30))
- add Twitter and update og meta tags ([3c6be14](https://github.com/peterpeterparker/tietracker/commit/3c6be14a293a2d686fb9c70b6d24100e54b9a520))

<a name="0.7.0"></a>

# 0.7.0 (2020-02-09)

### Features

- once a week, ask if a backup of the current open invoices should be exported ([#50](https://github.com/peterpeterparker/tietracker/issues/50))

<a name="0.6.0"></a>

# 0.6.0 (2020-02-04)

### Breaking Changes

- replace and simplify local notifications to fix cancellation reliability ([#46](https://github.com/peterpeterparker/tietracker/issues/46))

<a name="0.5.4"></a>

# 0.5.4 (2020-02-03)

### Fix

- local notifications random ID

<a name="0.5.3"></a>

# 0.5.3 (2020-02-02)

### Fix

- export to Excel timezone ([#47](https://github.com/peterpeterparker/tietracker/issues/47))
- local notifications not always canceled on Android ([#46](https://github.com/peterpeterparker/tietracker/issues/46))

<a name="0.5.2"></a>

# 0.5.2 (2020-01-23)

### Fix

- add not subtract vat in export to XLSX ([#44](https://github.com/peterpeterparker/tietracker/pull/44))
- hourly rate could contains cents ([#45](https://github.com/peterpeterparker/tietracker/pull/45))

<a name="0.5.1"></a>

# 0.5.1 (2020-01-22)

### Fix

- export to XLSX doesn't work on mobile devices ([#42](https://github.com/peterpeterparker/tietracker/issues/42))

<a name="0.5.0"></a>

# 0.5.0 (2020-01-22)

### Fix

- manual entry duration ([#33](https://github.com/peterpeterparker/tietracker/pull/33))
- refresh observed complex store objects ([#39](https://github.com/peterpeterparker/tietracker/pull/39))

### Features

- export to XLSX ([#34](https://github.com/peterpeterparker/tietracker/issues/34) and [#35](https://github.com/peterpeterparker/tietracker/issues/35))
- select currency in a new modal with a filter option ([#32](https://github.com/peterpeterparker/tietracker/pull/32))
- update dependencies ([#38](https://github.com/peterpeterparker/tietracker/pull/38))
- better handle entries dates and storage ([#40](https://github.com/peterpeterparker/tietracker/pull/40))
- disable entries actions if billed ([#41](https://github.com/peterpeterparker/tietracker/pull/41))

<a name="0.4.0"></a>

# 0.4.0 (2020-01-13)

### Fix

- highlight first call to action for Safari and Firefox ([#29](https://github.com/peterpeterparker/tietracker/pull/29))

### Features

- add manual entry ([#31](https://github.com/peterpeterparker/tietracker/pull/31))
- add local notifications for reminder ([#30](https://github.com/peterpeterparker/tietracker/pull/30))

<a name="0.3.0"></a>

# 0.3.0 (2020-01-08)

### Features

- display the first action with a box-shadow ([#28](https://github.com/peterpeterparker/tietracker/pull/28))
- add some cancel buttons to go back ([#27](https://github.com/peterpeterparker/tietracker/pull/27))
- revert back to display summary before projects ([#26](https://github.com/peterpeterparker/tietracker/pull/26))

<a name="0.2.0"></a>

# 0.2.0 (2020-01-07)

### Fix

- stop task round comparison doesn't amend hours ([#19](https://github.com/peterpeterparker/tietracker/pull/19))
- if export is canceled, reactive button ([#22](https://github.com/peterpeterparker/tietracker/pull/22))

### Features

- display today's values in summary ([#20](https://github.com/peterpeterparker/tietracker/pull/20))
- add a date picker to select the diary entries ([#21](https://github.com/peterpeterparker/tietracker/pull/21))
- sort diary entries by "from" date ([#24](https://github.com/peterpeterparker/tietracker/pull/24))
- display toast when saving settings ([#23](https://github.com/peterpeterparker/tietracker/pull/23))
- feat: invert order projects and summary ([#25](https://github.com/peterpeterparker/tietracker/pull/25))
