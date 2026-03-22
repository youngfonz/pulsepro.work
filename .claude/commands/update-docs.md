Review all recent code changes (git diff against main, recent commits, and any uncommitted work) and update the documentation files in the `docs/` folder to reflect the current state of the product.

## Files to update

1. **`docs/QA-TESTING-CHECKLIST.md`** — The master QA checklist. Add/update test items for any new features, UI changes, or behavioral changes. Follow the existing persona structure (New User, Admin, Super Admin, Mobile App). Each test item should be a checkbox (`- [ ]`) with a clear, testable action.

2. **`docs/features.html`** — The feature catalog HTML page. Add new features to the appropriate section or create a new section if needed. Follow the existing HTML structure and styling patterns.

3. **`docs/qa-checklist.html`** — The interactive QA checklist HTML page. Keep in sync with the markdown checklist — same test items, same structure, but in the interactive HTML format.

4. **`docs/qa-checklist-automated.html`** — The automated QA results page. Update test items to match the other checklists.

## Rules

- Read each file before editing to understand the current structure
- Only add items for genuinely new or changed features — don't duplicate existing items
- Use the same formatting, indentation, and style as existing entries
- Group new items logically near related existing items
- If a feature was removed, remove its test items
- If a feature changed behavior, update the test item description
- After updating, list a summary of what was added/changed in each file
