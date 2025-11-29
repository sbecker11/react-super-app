import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import './LoginRegister.css';
import { 
  validationConfig, 
  validatePasswordRules, 
  getPasswordRequirements 
} from './validationConfig';

/**
 * Build Yup Validation Schema from centralized configuration
 * 
 * This ensures validation rules and error messages stay in sync.
 * All rules come from validationConfig - update rules there to update everywhere.
 */
const buildValidationSchema = () => {
  const nameConfig = validationConfig.name;
  const emailConfig = validationConfig.email;
  
  return Yup.object().shape({
    name: Yup.string()
      .required(nameConfig.messages.required)
      .min(nameConfig.minLength, nameConfig.messages.minLength(nameConfig.minLength))
      .max(nameConfig.maxLength, nameConfig.messages.maxLength(nameConfig.maxLength))
      .matches(nameConfig.pattern, nameConfig.messages.pattern),
    
    email: Yup.string()
      .required(emailConfig.messages.required)
      .test('email-format', emailConfig.messages.invalid(emailConfig.example), function(value) {
        if (!value) return true; // Required check is handled by .required() above
        // Use Yup's built-in email validation
        return Yup.string().email().isValidSync(value);
      }),
    
    password: Yup.string()
      .required(validationConfig.password.messages.required)
      .test('password-rules', function(value) {
        if (!value || value.length === 0) {
          return true; // Required check is handled by .required() above
        }
        const brokenRules = validatePasswordRules(value);
        if (brokenRules) {
          return this.createError({ message: brokenRules });
        }
        return true;
      }),
  });
};

const validationSchema = buildValidationSchema();

const LoginRegister = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  /**
   * Check if form is valid using Yup
   * Disables submit button when any required field is invalid
   */
  useEffect(() => {
    const checkFormValidity = async () => {
      try {
        const isValid = await validationSchema.isValid(profileData);
        setIsFormValid(isValid);
      } catch (error) {
        setIsFormValid(false);
      }
    };
    
    checkFormValidity();
  }, [profileData]);

  /**
   * Validate a single field using Yup
   * Used for real-time validation on blur
   */
  const validateField = async (fieldName, value) => {
    try {
      // Validate single field using Yup
      await validationSchema.validateAt(fieldName, { [fieldName]: value });
      // Clear error for this field if validation passes
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[fieldName];
        return newErrors;
      });
    } catch (error) {
      // Set error for this field using Yup error message
      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: error.message,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Handle field blur event - validate field using Yup when user leaves the field
   */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Validate field on blur (including empty fields for required validation)
    validateField(name, value);
  };

  /**
   * Handle form submission - validates all fields using Yup before submitting
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate entire form using Yup schema
    try {
      // Use Yup to validate all fields
      await validationSchema.validate(profileData, { abortEarly: false });
      
      // All Yup validations passed - clear errors and submit
      setErrors({});
      console.log('Form is valid! Data:', profileData);
      // You can add code here to send the profile data to the server or perform other actions.
    } catch (validationErrors) {
      // Yup validation failed - collect and display all errors
      const errorsObject = {};
      validationErrors.inner.forEach((error) => {
        errorsObject[error.path] = error.message;
      });
      setErrors(errorsObject);
      console.log('Form has validation errors:', errorsObject);
    }
  };

  const handleClear = () => {
    setProfileData({
      name: '',
      email: '',
      password: '',
    });
    setErrors({});
    setIsFormValid(false); // Form is invalid after clearing
  };

  return (
    <div>
      <h2>LoginRegister</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        
        <div className={`input-container ${errors.name ? 'error' : ''}`}>
          <div className="label-error-container">
            <label htmlFor="name">Name</label>
            {errors.name && <div className="error">{errors.name}</div>}
          </div>
          <input
            type="text"
            id="name"
            name="name"
            value={profileData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="name"
            required
            className={errors.name ? 'error-input' : ''}
          />
        </div>

        <div className={`input-container ${errors.email ? 'error' : ''}`}>
          <div className="label-error-container">
            <label htmlFor="email">Email</label>
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="email"
            required
            className={errors.email ? 'error-input' : ''}
          />
        </div>

        <div className={`input-container ${errors.password ? 'error' : ''}`}>
          <div className="label-error-container">
            <label htmlFor="password">Password</label>
            {errors.password && <div className="error">{errors.password}</div>}
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={profileData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="current-password"
            required
            className={errors.password ? 'error-input' : ''}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            <strong>Password must contain:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              {getPasswordRequirements().map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="button-container">
          <button type="button" onClick={handleClear}>Clear</button>
          <button type="submit" disabled={!isFormValid}>Save</button>
        </div>
      </form>
    </div>
  );
};

export default LoginRegister;
