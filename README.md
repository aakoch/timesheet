# Timesheet

Timesheet helps me keep track of time by recording the times I log in and log out of work.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install Timesheet.

```bash
npm install @aakoch/timesheet
```

## Usage

Add to your .zshrc:
```shell
source src/.aliases
```

Log in:
```
li
```

Log out:
```
lo
```

Report times:
```
timesheet
```

### Options
```
li or lo:
xm - timestamp x minutes earlier
xh - timestamp x hours earlier
These can be used together.
Example: li 1h 30m - log in 1 hour and 30 minutes earlier

timesheet:
--printIntervals - Print the intervals between logging in and logging out used to determine totals
Example: timesheet --printIntervals
--printWeekly    - Print weekly summaries
Example: timesheet --printWeekly
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Packaging

```shell
npm version [major|minor|patch|etc]
```

## Code of Conduct
Please read the [code of conduct](CODE_OF_CONDUCT.md) before contributing.

## License
[GNU General Public License v3.0 or later](https://www.gnu.org/licenses/gpl-3.0.html)