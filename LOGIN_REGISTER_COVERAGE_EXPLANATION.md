# LoginRegister.js Coverage Explanation

## Issue: Uncovered Line 29

### Initial Coverage Report
```
LoginRegister.js | 95.23 | 100 | 87.5 | 95.23 | 29
```
- **Uncovered Line**: 29 (shown in red)

### What Was Line 29?

Line 29 is:
```javascript
setErrors({});
```

This line is inside the `.then()` callback of the validation promise, executed when form validation **succeeds**.

### Why Was It Uncovered?

The tests only covered **validation failure scenarios**:
- Invalid email addresses
- Weak passwords
- Missing required fields

But **no test covered the success case** where:
- Email is valid
- Password meets all criteria
- Validation passes → `.then()` callback executes → `setErrors({})` is called

### Root Cause

The validation schema required a `name` field:
```javascript
name: Yup.string().required('Name is required'),
```

But the form **had no name input field**, meaning:
- `profileData.name` was always an empty string `''`
- Validation would **always fail** (name is required)
- The success path (`.then()` block) would **never execute**
- Line 29 would never be reached

### Solution

1. **Removed `name` from validation schema** - Since there's no name field in the form, it shouldn't be validated
2. **Added tests for successful validation**:
   - Test that clears errors when form validation succeeds
   - Test that submits form successfully with valid data

### Result

✅ **100% coverage across all metrics:**
- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

All code paths are now tested, including the success path that clears errors when validation passes.

## Lesson Learned

When validation schemas don't match the form fields:
- Validation will always fail for missing required fields
- Success paths in validation callbacks won't be executed
- Coverage reports will show uncovered lines in success paths

Always ensure validation schemas match the actual form fields!

