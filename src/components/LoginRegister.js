import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import './LoginRegister.css';
import { 
  validationConfig, 
  validatePasswordRules, 
  getPasswordRequirements 
} from './validationConfig';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import Loading from './Loading';

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
  const navigate = useNavigate();
  const { register: registerUser, login: loginUser, isAuthenticated } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/analyzer');
    }
  }, [isAuthenticated, navigate]);

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
    
    // Prevent double submission
    if (isSubmitting) return;
    
    // Validate entire form using Yup schema
    try {
      // Use Yup to validate all fields
      await validationSchema.validate(profileData, { abortEarly: false });
      
      // All Yup validations passed - clear errors and submit
      setErrors({});
      setIsSubmitting(true);

      try {
        if (isLoginMode) {
          // Login mode - only email and password required
          const response = await authAPI.login(profileData.email, profileData.password);
          loginUser(response.user, response.token);
          navigate('/analyzer');
        } else {
          // Register mode - all fields required
          const response = await authAPI.register({
            name: profileData.name,
            email: profileData.email,
            password: profileData.password,
          });
          registerUser(response.user, response.token);
          navigate('/analyzer');
        }
      } catch (apiError) {
        // Handle API errors
        toast.error(apiError.message || 'An error occurred. Please try again.');
        setErrors({ api: apiError.message });
      } finally {
        setIsSubmitting(false);
      }
    } catch (validationErrors) {
      // Yup validation failed - collect and display all errors
      const errorsObject = {};
      validationErrors.inner.forEach((error) => {
        errorsObject[error.path] = error.message;
      });
      setErrors(errorsObject);
      toast.error('Please fix the validation errors');
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

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    // Keep email and password, clear name when switching modes
    if (!isLoginMode) {
      setProfileData(prev => ({ ...prev, name: '' }));
    }
  };

  // Show loading spinner while submitting
  if (isSubmitting) {
    return <Loading message={isLoginMode ? "Logging in..." : "Creating your account..."} />;
  }

  return (
    <div>
      <h2>{isLoginMode ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        
        {/* Show name field only in register mode */}
        {!isLoginMode && (
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
        )}

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

        {/* Display API errors */}
        {errors.api && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#fee', 
            border: '1px solid #fcc',
            borderRadius: '4px',
            marginTop: '10px',
            color: '#c00'
          }}>
            {errors.api}
          </div>
        )}

        <div className="button-container">
          <button type="button" onClick={handleClear}>Clear</button>
          <button type="submit" disabled={!isFormValid || isSubmitting}>
            {isLoginMode ? 'Login' : 'Register'}
          </button>
        </div>

        {/* Toggle between login and register */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isLoginMode 
              ? "Don't have an account? Register here" 
              : "Already have an account? Login here"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginRegister;
