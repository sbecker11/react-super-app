# Keeping Yup Validation Rules and Error Messages in Sync

## Overview

All validation rules and error messages are now centralized in a single configuration file to ensure they stay in sync across:
- Yup validation schema
- Error messages displayed to users
- UI requirements lists

## Centralized Configuration

**File**: `src/components/validationConfig.js`

This file is the **single source of truth** for all validation rules and messages.

## How It Works

### 1. Configuration Structure

```javascript
export const validationConfig = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    messages: { ... }
  },
  email: {
    example: 'user@example.com',
    messages: { ... }
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    messages: { ... }
  }
};
```

### 2. Automatic Synchronization

When you update `validationConfig.js`, changes automatically apply to:
- ✅ **Yup schema** - Built from config via `buildValidationSchema()`
- ✅ **Error messages** - Generated from config messages
- ✅ **UI requirements** - Generated from config via `getPasswordRequirements()`
- ✅ **Validation logic** - Uses config rules via `validatePasswordRules()`

## How to Update Validation Rules

### Example 1: Change Minimum Password Length

**Before:**
```javascript
password: {
  minLength: 8,
  ...
}
```

**Update in `validationConfig.js`:**
```javascript
password: {
  minLength: 12,  // Changed from 8 to 12
  ...
}
```

**Result:**
- ✅ Yup validation now requires 12 characters
- ✅ Error message automatically says "at least 12 characters"
- ✅ UI requirements list automatically shows "At least 12 characters"
- ✅ All in sync - no other files to update!

### Example 2: Change Email Example

**Update in `validationConfig.js`:**
```javascript
email: {
  example: 'john.doe@company.com',  // Changed example
  messages: {
    invalid: (example) => `Invalid email address. Example: ${example}`,
  }
}
```

**Result:**
- ✅ Error message automatically uses new example
- ✅ No other files to update!

### Example 3: Change Name Minimum Length

**Update in `validationConfig.js`:**
```javascript
name: {
  minLength: 3,  // Changed from 2 to 3
  messages: {
    minLength: (min) => `Name must be at least ${min} characters`,
  }
}
```

**Result:**
- ✅ Yup validation requires 3 characters
- ✅ Error message says "at least 3 characters"
- ✅ All synchronized!

### Example 4: Add/Remove Password Rules

**Update in `validationConfig.js`:**
```javascript
password: {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  requireSpecialChar: false,  // Disable special character requirement
  ...
}
```

**Result:**
- ✅ Validation no longer checks for special characters
- ✅ UI requirements list automatically excludes it
- ✅ Error messages automatically exclude it
- ✅ All synchronized!

## File Structure

```
src/components/
├── validationConfig.js     ← Single source of truth (UPDATE HERE)
├── LoginRegister.js        ← Uses config (auto-syncs)
└── LoginRegister.test.js   ← Tests (may need updates when rules change)
```

## Best Practices

### ✅ DO:

1. **Update `validationConfig.js` only** - All other files use this config
2. **Use message functions** - For dynamic values (e.g., `(min) => \`At least ${min}\``)
3. **Test after changes** - Run tests to verify sync is working
4. **Update tests if needed** - When rules change significantly

### ❌ DON'T:

1. **Don't hardcode rules** - Use config instead
2. **Don't duplicate messages** - Define once in config
3. **Don't update schema directly** - Update config, schema builds automatically
4. **Don't update UI requirements manually** - Use `getPasswordRequirements()`

## Update Checklist

When changing validation rules:

- [ ] Update `validationConfig.js`
  - [ ] Change rule values (minLength, maxLength, etc.)
  - [ ] Update error messages if needed
- [ ] Run tests: `npm test LoginRegister.test.js`
- [ ] Verify in UI:
  - [ ] Error messages show correctly
  - [ ] Requirements list shows correctly
  - [ ] Validation works as expected
- [ ] Update tests if rules changed significantly

## Example: Complete Password Rule Change

**Scenario:** Change password from 8 to 12 characters minimum

**Step 1: Update config**
```javascript
// validationConfig.js
password: {
  minLength: 12,  // Changed from 8
  ...
}
```

**Step 2: Test**
```bash
npm test LoginRegister.test.js
```

**Step 3: Verify**
- ✅ Error message: "requires at least 12 characters, ..."
- ✅ UI requirements: "At least 12 characters"
- ✅ Validation rejects passwords < 12 characters

**That's it!** No other files to update.

## How Synchronization Works

### Password Requirements UI

```javascript
// LoginRegister.js
{getPasswordRequirements().map((req, index) => (
  <li key={index}>{req}</li>
))}
```

This automatically generates the list from config:
- Reads `password.requireUppercase`, `password.requireLowercase`, etc.
- Uses `password.messages.rules` for text
- Automatically stays in sync!

### Error Messages

```javascript
// validationConfig.js → LoginRegister.js
const brokenRules = validatePasswordRules(value);
// Uses config.rules and config.messages automatically
```

### Yup Schema

```javascript
// validationConfig.js → LoginRegister.js
const schema = buildValidationSchema();
// Reads all rules from config and builds Yup schema
```

## Troubleshooting

### Rule Changed but UI Didn't Update?

1. Check `validationConfig.js` was saved
2. Check you're using `getPasswordRequirements()` (not hardcoded list)
3. Restart dev server if needed

### Error Message Wrong?

1. Check `validationConfig.js` messages match your changes
2. Check message functions use correct parameters
3. Check you're using `validatePasswordRules()` (not custom logic)

### Tests Failing?

1. Update test expectations to match new rules
2. Check test uses actual error messages from config
3. Run full test suite

## Summary

✅ **Single Source of Truth**: `validationConfig.js`  
✅ **Auto-Sync**: Schema, messages, and UI all use config  
✅ **Easy Updates**: Change config once, updates everywhere  
✅ **Type-Safe**: Message functions ensure consistency  
✅ **Maintainable**: No duplicate code or manual sync needed  

**Remember**: Always update `validationConfig.js` first, and everything else will stay in sync automatically!

