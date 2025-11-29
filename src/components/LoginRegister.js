import React, { useState } from 'react';
import * as Yup from 'yup';
import './LoginRegister.css'; // Import your CSS file

const LoginRegister = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const schema = Yup.object().shape({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string()
        .matches(
          /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
          'Password must meet criteria'
        )
        .required('Password is required'),
    });

    schema
      .validate(profileData, { abortEarly: false })
      .then(() => {
        setErrors({});
      })
      .catch((validationErrors) => {
        const errorsObject = {};
        validationErrors.inner.forEach((error) => {
          errorsObject[error.path] = error.message;
        });
        setErrors(errorsObject);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateForm();
    // You can add code here to send the profile data to the server or perform other actions.
  };

  const handleClear = () => {
    setProfileData({
      name: '',
      email: '',
      password: '',
    });
    setErrors({});
  };

  return (
    <div>
      <h2>LoginRegister</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        
        <div className="input-container">
          <div className="label-error-container">
            <label htmlFor="email">Email</label>
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
          <input
            type="text"
            id="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div className="input-container">
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
            autoComplete="current-password"
          />
        </div>

        <div className="button-container">
          <button type="button" onClick={handleClear}>Clear</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export default LoginRegister;
