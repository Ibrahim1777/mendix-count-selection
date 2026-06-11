# Count Selection

A Mendix pluggable widget (Web) that renders a **searchable combobox** for selecting a numeric value generated from a configurable **min / max / step** range. Supports Integer, Long, and Decimal attributes.

## Features

- Generates dropdown options from a minimum value, maximum value, and step size — all three are **Decimal expressions**, so they work for integers (`0`, `100`, `1`) and decimals (`0.5`, `10`, `0.25`), and can be bound dynamically (e.g. `$currentObject/MaxCount`)
- **Searchable input** — type directly in the input to filter options; typed values that match an option (by label or numeric equality, so `1.5` matches `1.50`) are committed on Enter/blur
- Clearing the input empties the attribute, triggering Mendix required-attribute validation
- **On change** action, fired only when the value actually changed
- Standard Mendix **Editability** and **Visibility** system properties (conditional editability/visibility tabs in Studio Pro)
- Default Mendix **validation feedback** rendered below the input (`mx-validation-message`)
- Keyboard navigation (Arrow keys, Enter, Escape, Tab), outside-click commit, decimal-safe arithmetic via `big.js`
- Display precision auto-derived from the configured min/step (step `0.25` renders `1.75`; step `1` renders `2`)
- Safety cap of 5,000 generated options (logs a console warning if exceeded)

## Properties

| Property | Type | Description |
| --- | --- | --- |
| Value attribute | Integer / Long / Decimal attribute | Where the selected value is stored |
| Minimum value | Decimal expression | First option in the dropdown |
| Maximum value | Decimal expression | Last option (inclusive when reachable by step) |
| Step size | Decimal expression | Increment between options; must be > 0 |
| Searchable | Boolean | Allow typing in the input to filter options; when off, the input only opens the dropdown |
| Placeholder | Text template | Shown when no value is selected |
| No results text | Text template | Shown when the search matches no options |
| On change | Action | Executed after the value changes (including clearing) |

## Usage

1. Download the latest `siemens.CountSelection.mpk` from [Releases](https://github.com/Ibrahim1777/mendix-count-selection/releases) (or build it yourself, see below) and place it in your Mendix project's `widgets/` folder, or import it via **App > Synchronize App Directory** after copying.
2. Drop **Count Selection** onto a page inside a data container.
3. Set the value attribute, min/max/step expressions, and optionally the on-change action.

## Development

Prerequisites: Node.js ≥ 18.

```bash
npm install

# Dev build with watch + reload against a local Mendix project
npm start

# Production build — outputs dist/<version>/siemens.CountSelection.mpk
npm run release
```

To have `npm start` copy the widget into a local Mendix project automatically, set `projectPath` in `package.json` under `config`.

## Project structure

```
src/
├── CountSelection.xml              # Widget property definitions
├── CountSelection.tsx              # Container: Mendix props → component, option generation, onChange
├── CountSelection.editorPreview.tsx# Studio Pro design-mode preview
├── components/
│   └── CountDropdown.tsx           # CountCombobox: searchable input + dropdown UI
└── ui/
    └── CountSelection.css          # Atlas-aligned styling
```

## Version history

| Version | Changes |
| --- | --- |
| 1.2.0 | Combobox: input itself is searchable/editable; Editability & Visibility system properties; validation feedback |
| 1.1.0 | Initial implementation: min/max/step range dropdown with search box and on-change action |

## License

Apache-2.0
