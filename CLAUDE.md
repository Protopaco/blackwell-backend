# BlackwellTime Backend — Development Guidelines

## **Variable Naming — Non-Negotiable Rule**

**Every variable name must state exactly what it is. No abbreviations. No single-letter variables. No ambiguous shorthand. If someone reads the name without any other context, they must know precisely what the value represents.**

- `col` → `columnIndex`
- `r` → `rowIndex`
- `bg` → `backgroundColor`
- `numDays` → `daysInWeek`
- `d` → the actual thing it is (e.g., `date`, `employee`, `holidayRecord`)

**This rule applies everywhere: function parameters, local variables, loop variables, destructured values. No exceptions.**

## Comment Documentation

Every function must have a one-line comment immediately above its definition describing what it does and when it is used. Use two lines only when a single line would be too cramped to be useful.

**Add a comment when writing a new function:**
```ts
// Reads all employees directly from the Employees tab, bypassing any cache.
const readEmployees = async (payrollConfigFileId: string): Promise<Employee[]> => {
```

**Update the comment when changing a function's behavior:**
If you modify what a function does or when it is called, update its comment to match. Stale comments are worse than no comments.

**Style rules:**
- Start with a verb: "Reads", "Builds", "Returns", "Converts", "Writes", "Removes", etc.
- If the function is only called from one place, say so: "— called by generateTimesheets"
- If there is a non-obvious reason for the function to exist (e.g., bypasses a cache, handles a special API constraint), include that reason
- Do not describe what the code literally does line-by-line — describe the purpose and context

## Timesheet Theme

All colors and column widths used for timesheet styling live in `src/utils/timesheetTheme.ts`. Do not define color values inside `applyTimesheetFormatting.ts` or anywhere else — import them from the theme file. When adding a new styled element, add its color to the theme file first, then reference it by name.
