import React, { useState } from 'react';

const JDAnalyzer = () => {
  const [currentJD, setCurrentJD] = useState({
    date: new Date().toISOString().split('T')[0],
    contactInfo: '',
    jobInfo: '',
    jobTitle: '',
    consultingRate: '',
    consultingPeriod: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentJD({ ...currentJD, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('JD Data:', currentJD);
    // TODO: Add functionality to save/analyze JD
  };

  const handleClear = () => {
    setCurrentJD({
      date: new Date().toISOString().split('T')[0],
      contactInfo: '',
      jobInfo: '',
      jobTitle: '',
      consultingRate: '',
      consultingPeriod: '',
      description: '',
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Job Description Analyzer
      </h2>
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="date" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Date:
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={currentJD.date}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="jobTitle" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Job Title:
            </label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              value={currentJD.jobTitle}
              onChange={handleChange}
              placeholder="Enter job title"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="contactInfo" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Contact Info:
            </label>
            <input
              type="text"
              id="contactInfo"
              name="contactInfo"
              value={currentJD.contactInfo}
              onChange={handleChange}
              placeholder="Enter contact information"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="consultingRate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Consulting Rate:
            </label>
            <input
              type="text"
              id="consultingRate"
              name="consultingRate"
              value={currentJD.consultingRate}
              onChange={handleChange}
              placeholder="Enter consulting rate"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="consultingPeriod" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Consulting Period:
            </label>
            <input
              type="text"
              id="consultingPeriod"
              name="consultingPeriod"
              value={currentJD.consultingPeriod}
              onChange={handleChange}
              placeholder="Enter consulting period"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="jobInfo" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Job Info:
            </label>
            <textarea
              id="jobInfo"
              name="jobInfo"
              value={currentJD.jobInfo}
              onChange={handleChange}
              placeholder="Enter job information"
              rows="4"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description:
            </label>
            <textarea
              id="description"
              name="description"
              value={currentJD.description}
              onChange={handleChange}
              placeholder="Enter job description"
              rows="6"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save & Analyze
            </button>
          </div>
        </form>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontStyle: 'italic', color: '#6c757d' }}>
          💡 Note: Analysis functionality is coming soon. Form data will be processed and analyzed.
        </p>
      </div>
    </div>
  );
};

export default JDAnalyzer;