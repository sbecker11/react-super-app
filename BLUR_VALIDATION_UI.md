# Blur Validation UI Changes

## Overview

When a user leaves (blurs) an input field, Yup validation is triggered and UI changes occur to indicate validation status.

## Current UI Changes on Blur

### 1. **Error Message Display** ✅

When a field is **invalid** on blur:
- A **red error message** appears below the field label
- Error messages are specific to the validation failure:
  - **Name**: "Name is required", "Name must be at least 2 characters", etc.
  - **Email**: "Email is required", "Invalid email address"
  - **Password**: "Password is required", "Password must be at least 8 characters", etc.

### 2. **Input Field Visual Feedback** ✅

When a field is **invalid** on blur:
- Input field border turns **red** (`border-color: #dc3545`)
- Border width increases to **2px** for emphasis
- When focused, shows a **red shadow/glow** effect

When a field is **valid** on blur:
- Error message disappears (if it was showing)
- Input field border returns to normal grey (`#ccc`)
- No visual indication of validity (no green border)

### 3. **Normal State (No Errors)**

When a field is **valid** or **not yet validated**:
- Input border is **grey** (`#ccc`)
- On focus, border turns **blue** (`#007bff`)
- Smooth transitions for border color changes

## Visual Flow

### Invalid Field Example:
1. User types invalid data (e.g., "a" in name field)
2. User clicks/tabs away (blur event)
3. **Yup validates** the field
4. **Error message appears** in red text
5. **Input border turns red** (2px border)
6. User starts typing → error clears immediately
7. User blurs again → validates and shows appropriate feedback

### Valid Field Example:
1. User types valid data (e.g., "John Doe" in name field)
2. User clicks/tabs away (blur event)
3. **Yup validates** the field
4. **No error message** (or error clears if it existed)
5. **Input border returns to normal** grey color

## Validation Timing

- **On Blur**: Validates immediately when user leaves the field
- **On Submit**: Validates all fields at once, showing all errors
- **On Change**: Errors clear immediately when user starts typing

## CSS Classes Applied

- **`.error`** class on `.input-container` when field has errors
- **`.error-input`** class on `<input>` when field has errors
- Error styling via `.input-container.error input` selector

## Error Messages Shown

### Name Field:
- "Name is required"
- "Name must be at least 2 characters"
- "Name must be less than 50 characters"
- "Name can only contain letters, spaces, hyphens, and apostrophes"

### Email Field:
- "Email is required"
- "Invalid email address"

### Password Field:
- "Password is required"
- "Password must be at least 8 characters"
- "Password must contain at least one uppercase letter"
- "Password must contain at least one lowercase letter"
- "Password must contain at least one number"
- "Password must contain at least one special character (!@#$%^&*)"

## Summary

**On blur with invalid field:**
✅ Red error message appears  
✅ Input border turns red (2px)  
✅ Red shadow on focus  

**On blur with valid field:**
✅ Error message clears  
✅ Input border returns to normal grey  

All validation is handled by **Yup** and provides immediate, clear visual feedback to users.

