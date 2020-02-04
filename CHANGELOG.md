<a name="0.6.0"></a>
# 0.6.0 (2020-02-04)

### Breaking Changes

* replace and simplify local notifications to fix cancellation reliability ([#46](https://github.com/peterpeterparker/tietracker/issues/46))

<a name="0.5.4"></a>
# 0.5.4 (2020-02-03)

### Fix

* local notifications random ID

<a name="0.5.3"></a>
# 0.5.3 (2020-02-02)

### Fix

* export to Excel timezone ([#47](https://github.com/peterpeterparker/tietracker/issues/47))
* local notifications not always canceled on Android ([#46](https://github.com/peterpeterparker/tietracker/issues/46))

<a name="0.5.2"></a>
# 0.5.2 (2020-01-23)

### Fix

* add not subtract vat in export to XLSX ([#44](https://github.com/peterpeterparker/tietracker/pull/44))
* hourly rate could contains cents ([#45](https://github.com/peterpeterparker/tietracker/pull/45))

<a name="0.5.1"></a>
# 0.5.1 (2020-01-22)

### Fix

* export to XLSX doesn't work on mobile devices ([#42](https://github.com/peterpeterparker/tietracker/issues/42))

<a name="0.5.0"></a>
# 0.5.0 (2020-01-22)

### Fix

* manual entry duration ([#33](https://github.com/peterpeterparker/tietracker/pull/33))
* refresh observed complex store objects ([#39](https://github.com/peterpeterparker/tietracker/pull/39))

### Features

* export to XLSX ([#34](https://github.com/peterpeterparker/tietracker/issues/34) and [#35](https://github.com/peterpeterparker/tietracker/issues/35))
* select currency in a new modal with a filter option ([#32](https://github.com/peterpeterparker/tietracker/pull/32))
* update dependencies ([#38](https://github.com/peterpeterparker/tietracker/pull/38))
* better handle entries dates and storage ([#40](https://github.com/peterpeterparker/tietracker/pull/40))
* disable entries actions if billed ([#41](https://github.com/peterpeterparker/tietracker/pull/41))

<a name="0.4.0"></a>
# 0.4.0 (2020-01-13)

### Fix

* highlight first call to action for Safari and Firefox ([#29](https://github.com/peterpeterparker/tietracker/pull/29))

### Features

* add manual entry ([#31](https://github.com/peterpeterparker/tietracker/pull/31))
* add local notifications for reminder ([#30](https://github.com/peterpeterparker/tietracker/pull/30))

<a name="0.3.0"></a>
# 0.3.0 (2020-01-08)

### Features

* display the first action with a box-shadow ([#28](https://github.com/peterpeterparker/tietracker/pull/28))
* add some cancel buttons to go back ([#27](https://github.com/peterpeterparker/tietracker/pull/27))
* revert back to display summary before projects ([#26](https://github.com/peterpeterparker/tietracker/pull/26))

<a name="0.2.0"></a>
# 0.2.0 (2020-01-07)

### Fix

* stop task round comparison doesn't amend hours ([#19](https://github.com/peterpeterparker/tietracker/pull/19))
* if export is canceled, reactive button ([#22](https://github.com/peterpeterparker/tietracker/pull/22))

### Features

* display today's values in summary ([#20](https://github.com/peterpeterparker/tietracker/pull/20))
* add a date picker to select the diary entries ([#21](https://github.com/peterpeterparker/tietracker/pull/21))
* sort diary entries by "from" date ([#24](https://github.com/peterpeterparker/tietracker/pull/24))
* display toast when saving settings ([#23](https://github.com/peterpeterparker/tietracker/pull/23))
* feat: invert order projects and summary ([#25](https://github.com/peterpeterparker/tietracker/pull/25))
