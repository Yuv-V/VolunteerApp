import 'bootstrap/dist/css/bootstrap.css';
import React, { useState } from 'react';
import { db } from './firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const PublishOpportunity = () => {
  const [title, setTitle] = useState('');
  const [skillsRequired, setSkillsRequired] = useState([]);
  const [experienceRequired, setExperienceRequired] = useState('');
  const [description, setDescription] = useState('');
  const [companyName, setCompanyName] = useState('');

  // List of available skills
  const availableSkills = [
    'Tutoring',
    'Catering',
    'Teaching',
    'Mentoring',
    'Event Planning',
    'Fundraising',
    'Public Speaking',
    'Graphic Design',
    'Social Media Management',
    'First Aid',
    'Translation',
    'Gardening',
    'Construction',
    'Childcare',
    'Elderly Care',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Add new opportunity to Firestore
      await addDoc(collection(db, "opportunities"), {
        title,
        skillsRequired,
        experienceRequired,
        description,
        companyName,
        signupCount: 0,
      });

      alert('Opportunity published successfully!');
      setTitle('');
      setSkillsRequired([]);
      setExperienceRequired('');
      setDescription('');
      setCompanyName('');
    } catch (e) {
      console.error("Error adding opportunity: ", e);
      alert('Failed to publish opportunity.');
    }
  };

  // Navigate to home page without using React Router Link
  const navigateToHome = () => {
    window.location.href = '/';
  };

  // Custom styles to override any Bootstrap constraints
  const fullWidthStyle = {
    width: '100vw',
    maxWidth: '100%',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    overflowX: 'hidden'
  };

  const cardStyle = {
    width: '100%',
    margin: 0,
    borderLeft: 'none',
    borderRight: 'none',
    borderRadius: 0
  };

  return (
    <div className="bg-dark text-light min-vh-100" style={fullWidthStyle}>
      {/* Header - full width */}
      <div className="w-100 py-4 mb-0 bg-dark border-bottom border-secondary" style={{padding: '0'}}>
        <h1 className="display-5 fw-bold text-info text-center m-0">Publish Your Opportunity</h1>
      </div>
      
      {/* Main Form - full width with no padding */}
      <div className="w-100" style={{padding: '0'}}>
        <div className="card bg-dark text-light border-secondary" style={cardStyle}>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-4 mx-0">
                {/* First column */}
                <div className="col-12 col-md-6 px-4">
                  <div className="mb-4">
                    <label htmlFor="title" className="form-label fw-bold text-info fs-5">Opportunity Title</label>
                    <input
                      type="text"
                      className="form-control form-control-lg bg-dark text-light border-secondary"
                      id="title"
                      placeholder="Enter opportunity title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="company" className="form-label fw-bold text-info fs-5">Company Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg bg-dark text-light border-secondary"
                      id="company"
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="experience" className="form-label fw-bold text-info fs-5">Experience Level</label>
                    <select
                      className="form-select form-select-lg bg-dark text-light border-secondary"
                      id="experience"
                      value={experienceRequired}
                      onChange={(e) => setExperienceRequired(e.target.value)}
                      required
                    >
                      <option value="">Select Experience Level</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                {/* Second column */}
                <div className="col-12 col-md-6 px-4">
                  <div className="mb-4 h-100">
                    <label htmlFor="skills" className="form-label fw-bold text-info fs-5">Required Skills</label>
                    <select
                      className="form-select form-select-lg bg-dark text-light border-secondary"
                      id="skills"
                      multiple
                      style={{height: "calc(100% - 60px)", minHeight: "200px"}}
                      value={skillsRequired}
                      onChange={(e) => {
                        const selectedSkills = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        setSkillsRequired(selectedSkills);
                      }}
                      required
                    >
                      {availableSkills.map((skill, index) => (
                        <option key={index} value={skill} className="py-1">
                          {skill}
                        </option>
                      ))}
                    </select>
                    <div className="form-text text-light-50 mt-2">Hold Ctrl/Cmd to select multiple skills</div>
                  </div>
                </div>
                
                {/* Full width description */}
                <div className="col-12 px-4">
                  <div className="mb-5">
                    <label htmlFor="description" className="form-label fw-bold text-info fs-5">Opportunity Description</label>
                    <textarea
                      className="form-control form-control-lg bg-dark text-light border-secondary"
                      id="description" 
                      rows="6"
                      placeholder="Describe the opportunity in detail..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="col-12 col-md-6 px-4">
                  <button type="submit" className="btn btn-info btn-lg py-3 fw-bold text-dark w-100">
                    Publish Opportunity
                  </button>
                </div>
                <div className="col-12 col-md-6 px-4">
                  <button 
                    type="button"
                    onClick={navigateToHome} 
                    className="btn btn-outline-light btn-lg py-3 w-100"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishOpportunity;