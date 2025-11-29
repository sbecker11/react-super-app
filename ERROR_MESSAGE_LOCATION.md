# Validation Error Message Location in UI

## Where Error Messages Are Displayed

Validation error messages appear **on the same horizontal line as the field label**, aligned to the **right side** of the container.

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  .label-error-container                     │
│  ┌─────────────┐        ┌────────────────┐ │
│  │  Label      │        │  Error Message │ │
│  │  (left)     │        │  (right, red)  │ │
│  └─────────────┘        └────────────────┘ │
└─────────────────────────────────────────────┘
│  Input Field (below)                        │
└─────────────────────────────────────────────┘
```

### HTML Structure

```jsx
<div className="label-error-container">
  <label htmlFor="name">Name</label>
  {errors.name && <div className="error">{errors.name}</div>}
</div>
<input ... />
```

### Visual Example

**Name Field:**
```
Name                                    Name is required
[___________________________]
```

**Email Field:**
```
Email                               Invalid email address
[___________________________]
```

**Password Field:**
```
Password                    Password must be at least 8 characters
[___________________________]
```

## CSS Styling

Error messages are styled with:
- **Color**: Red (`color: red`)
- **Font size**: 14px
- **Position**: Right-aligned within the label-error-container
- **Display**: Flexbox layout with `justify-content: space-between`
  - Label on the left
  - Error message on the right

## When Error Messages Appear

1. **On Blur**: When user leaves a field (blur event)
   - Field validates using Yup
   - If invalid, error message appears on the right side of the label

2. **On Submit**: When form is submitted
   - All fields validate at once
   - All validation errors appear simultaneously

3. **On Change**: Error messages clear immediately when user starts typing

## Code Location

**Component**: `src/components/LoginRegister.js`

**Lines**:
- Name field error: Line 150
- Email field error: Line 168
- Password field error: Line 186

**CSS**: `src/components/LoginRegister.css`
- `.label-error-container` (lines 14-18)
- `.label-error-container .error` (lines 24-28)

## Summary

✅ **Location**: Same line as label, right-aligned  
✅ **Styling**: Red text, 14px font  
✅ **Layout**: Flexbox with label on left, error on right  
✅ **Display**: Only shows when `errors.fieldName` exists  
✅ **Fields**: Name, Email, Password all use the same pattern

