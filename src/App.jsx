import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocs, collection, updateDoc, increment, query, where, deleteDoc } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PublishOpportunity from './PublishOpportunity';

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [skills, setSkills] = useState([]);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [experience, setExperience] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signedUpOpportunities, setSignedUpOpportunities] = useState([]);

  // List of available skills for the multi-select dropdown
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
      let existingUser;
      if (isSignUp) {
        existingUser = await createUserWithEmailAndPassword(auth, email, password);
        const userRef = doc(db, 'users', existingUser.user.uid);
        await setDoc(userRef, {
          createdAt: new Date().toISOString(),
          dateOfBirth,
          email,
          experience,
          fName,
          lName,
          skills: skills.join(', '),
        });
      } else {
        existingUser = await signInWithEmailAndPassword(auth, email, password);
      }

      const userRef = doc(db, 'users', existingUser.user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        console.log('No user data found in Firestore');
      }

      alert('User signed in or signed up successfully!');
    } catch (error) {
      console.error('Error during sign-up/sign-in:', error.message);
      alert('Error during sign-up/sign-in: ' + error.message);
    }
  };

  // Handle skill selection
  const handleSkillChange = (e) => {
    const selectedSkills = Array.from(e.target.selectedOptions, (option) => option.value);
    setSkills(selectedSkills);
  };

  // Function to sign up for an opportunity
  const signUpForOpportunity = async (opportunityId) => {
    if (!user) {
      alert('You must be logged in to sign up for an opportunity.');
      return;
    }

    try {
      // Check if the user has already signed up
      const signupRef = doc(db, 'signups', `${user.uid}_${opportunityId}`);
      const signupDoc = await getDoc(signupRef);

      if (signupDoc.exists()) {
        alert('You have already signed up for this opportunity.');
        return;
      }

      // Add a new sign-up document
      await setDoc(signupRef, {
        userId: user.uid,
        opportunityId,
        signedUpAt: new Date().toISOString(),
      });

      // Update the opportunity's signup count
      const opportunityRef = doc(db, 'opportunities', opportunityId);
      await updateDoc(opportunityRef, {
        signupCount: increment(1),
      });

      alert('You have successfully signed up for this opportunity!');
      fetchUserSignups(user.uid);
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Failed to sign up. Please try again.');
    }
  };

  // Function to cancel a sign-up
  const cancelSignUp = async (opportunityId) => {
    if (!user) {
      alert('You must be logged in to cancel a sign-up.');
      return;
    }

    try {
      // Delete the sign-up document
      const signupRef = doc(db, 'signups', `${user.uid}_${opportunityId}`);
      await deleteDoc(signupRef);

      // Decrement the opportunity's signup count
      const opportunityRef = doc(db, 'opportunities', opportunityId);
      await updateDoc(opportunityRef, {
        signupCount: increment(-1),
      });

      alert('You have successfully canceled your sign-up for this opportunity.');
      fetchUserSignups(user.uid);
    } catch (error) {
      console.error('Error canceling sign-up:', error);
      alert('Failed to cancel sign-up. Please try again.');
    }
  };

  // Fetch user's signed-up opportunities
  const fetchUserSignups = async (userId) => {
    try {
      const signupsRef = collection(db, 'signups');
      const q = query(signupsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const signedUpOpportunities = [];
      querySnapshot.forEach((doc) => {
        signedUpOpportunities.push(doc.data().opportunityId);
      });

      setSignedUpOpportunities(signedUpOpportunities);
    } catch (error) {
      console.error('Error fetching user sign-ups:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log('No user data found in Firestore');
        }

        fetchUserSignups(currentUser.uid);
      } else {
        setUserData(null);
        setSignedUpOpportunities([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "opportunities"));
        const opportunitiesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const filteredOpportunities = opportunitiesList.filter(opportunity => 
          opportunity.title && 
          opportunity.companyName && 
          opportunity.skillsRequired && 
          opportunity.experienceRequired && 
          opportunity.description
        );

        setOpportunities(filteredOpportunities);
      } catch (e) {
        console.error("Error fetching opportunities: ", e);
      }
    };

    fetchOpportunities();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setUserData(null);
    setSignedUpOpportunities([]);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 text-center bg-dark text-light">
      <Router>
        <Routes>
          <Route path="/publish" element={<PublishOpportunity />} />
          <Route
            path="/"
            element={
              <div className="d-flex flex-column min-vh-100">
                {user ? (
                  <>
                    {/* Header with user info and buttons */}
                    <header className="bg-dark py-4 border-bottom border-secondary w-100">
                      <div className="container-fluid px-4">
                        <div className="row">
                          <div className="col-lg-8 text-start">
                            <h1 className="display-5 fw-bold text-light">Where do you want to volunteer, {userData ? userData.fName : 'User'}?</h1>
                            <div className="mt-3">
                              <p className="fs-5 mb-1"><span className="fw-bold text-info">Email:</span> {userData ? userData.email : 'Loading...'}</p>
                              <p className="fs-5 mb-1"><span className="fw-bold text-info">Experience:</span> {userData ? userData.experience : 'Loading...'}</p>
                              <p className="fs-5 mb-1"><span className="fw-bold text-info">Skills:</span> {userData ? userData.skills : 'Loading...'}</p>
                            </div>
                          </div>
                          <div className="col-lg-4 d-flex flex-column align-items-end justify-content-start">
                            <button 
                              onClick={handleLogout} 
                              className="btn btn-danger mb-2"
                            >
                              Log Out
                            </button>
                            <Link to="/publish" className="text-decoration-none">
                              <button className="btn btn-success">
                                Publish Opportunity
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </header>

                    {/* Main content - Opportunities */}
                    <main className="flex-grow-1 py-5 bg-dark w-100">
                      <div className="container-fluid px-4">
                        <h2 className="mb-4 text-start text-light">Available Opportunities</h2>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
                          {opportunities.map((opportunity) => (
                            <div key={opportunity.id} className="col">
                              <div className="card h-100 bg-dark text-light border border-secondary rounded-3 hover-shadow">
                                <div className="card-body p-4">
                                  <h4 className="card-title text-start mb-3 text-info">{opportunity.title}</h4>
                                  <div className="card-text text-start mb-4">
                                    <p className="mb-2"><i className="bi bi-building me-2"></i><strong className="text-light">Company:</strong> {opportunity.companyName}</p>
                                    <p className="mb-2"><i className="bi bi-tools me-2"></i><strong className="text-light">Skills Required:</strong> {Array.isArray(opportunity.skillsRequired) ? opportunity.skillsRequired.join(', ') : opportunity.skillsRequired}</p>
                                    <p className="mb-2"><i className="bi bi-star me-2"></i><strong className="text-light">Experience Required:</strong> {opportunity.experienceRequired}</p>
                                    <p className="mb-2"><i className="bi bi-info-circle me-2"></i><strong className="text-light">Description:</strong> {opportunity.description}</p>
                                    <p className="mb-0">
                                      <i className="bi bi-people me-2"></i>
                                      <strong className="text-light">Sign-Ups:</strong> 
                                      <span className="badge bg-info text-dark ms-2">{opportunity.signupCount || 0}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="card-footer bg-dark border-top border-secondary p-4">
                                  {signedUpOpportunities.includes(opportunity.id) ? (
                                    <button 
                                      onClick={() => cancelSignUp(opportunity.id)}
                                      className="btn btn-outline-danger w-100"
                                    >
                                      <i className="bi bi-x-circle me-2"></i>Cancel Sign-Up
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => signUpForOpportunity(opportunity.id)}
                                      className="btn btn-success w-100"
                                    >
                                      <i className="bi bi-check-circle me-2"></i>Sign Up
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* User's Signed-Up Opportunities */}
                      <div className="container-fluid px-4 mt-5">
                        <div className="card bg-dark text-light border border-secondary rounded-3">
                          <div className="card-header bg-info text-dark py-3">
                            <h3 className="mb-0 text-start">Your Signed-Up Opportunities</h3>
                          </div>
                          <div className="card-body p-4">
                            {signedUpOpportunities.length > 0 ? (
                              <div className="row">
                                {signedUpOpportunities.map((opportunityId) => {
                                  const opportunity = opportunities.find((opp) => opp.id === opportunityId);
                                  return opportunity ? (
                                    <div key={opportunityId} className="col-md-6 col-lg-4 col-xl-3 mb-4">
                                      <div className="card h-100 bg-dark text-light border border-secondary">
                                        <div className="card-body">
                                          <h5 className="card-title text-start mb-3 text-info">{opportunity.title}</h5>
                                          <p className="card-text text-start">{opportunity.description}</p>
                                          <p className="card-text text-start"><small className="text-muted">{opportunity.companyName}</small></p>
                                        </div>
                                      </div>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            ) : (
                              <div className="alert alert-dark border border-info text-light">
                                <i className="bi bi-info-circle me-2"></i>You have not signed up for any opportunities yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </main>
                  </>
                ) : (
<div className="vw-100 min-vh-100 d-flex justify-content-center align-items-center bg-dark">
  <div className="container">
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="card bg-dark text-light border border-secondary rounded-4">
          <div className="card-header bg-info text-dark text-center py-3">
            <h2 className="mb-0">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          </div>
          <div className="card-body p-4">
            {!formVisible && (
              <button 
                onClick={() => { setFormVisible(true); setIsSignUp(false); }}
                className="btn btn-info btn-lg w-100 text-dark"
              >
                Log In
              </button>
            )}

            {!user && isSignUp && (
              <div>
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                  <div className="form-floating">
                    <input 
                      type="email" 
                      className="form-control bg-dark text-light border-secondary" 
                      id="emailSignup"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Email"
                      required 
                    />
                    <label htmlFor="emailSignup" className="text-light">Email address</label>
                  </div>

                  <div className="form-floating">
                    <input 
                      type="password" 
                      className="form-control bg-dark text-light border-secondary" 
                      id="passwordSignup"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Password"
                      required 
                    />
                    <label htmlFor="passwordSignup" className="text-light">Password</label>
                  </div>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="text" 
                          className="form-control bg-dark text-light border-secondary" 
                          id="fNameSignup"
                          value={fName} 
                          onChange={(e) => setFName(e.target.value)} 
                          placeholder="First Name"
                          required 
                        />
                        <label htmlFor="fNameSignup" className="text-light">First Name</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="text" 
                          className="form-control bg-dark text-light border-secondary" 
                          id="lNameSignup"
                          value={lName} 
                          onChange={(e) => setLName(e.target.value)} 
                          placeholder="Last Name"
                          required 
                        />
                        <label htmlFor="lNameSignup" className="text-light">Last Name</label>
                      </div>
                    </div>
                  </div>

                  <div className="form-floating">
                    <input 
                      type="date" 
                      className="form-control bg-dark text-light border-secondary" 
                      id="dobSignup"
                      value={dateOfBirth} 
                      onChange={(e) => setDateOfBirth(e.target.value)} 
                      required 
                    />
                    <label htmlFor="dobSignup" className="text-light">Date of Birth</label>
                  </div>

                  <div className="form-floating">
                    <select 
                      className="form-select bg-dark text-light border-secondary" 
                      id="experienceSignup"
                      value={experience} 
                      onChange={(e) => setExperience(e.target.value)} 
                      required
                    >
                      <option value="">Select Experience Level</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <label htmlFor="experienceSignup" className="text-light">Experience Level</label>
                  </div>

                  <div className="form-group">
                    <label htmlFor="skillsSignup" className="form-label text-light">Skills (Hold Ctrl/Cmd to select multiple)</label>
                    <select
                      className="form-select bg-dark text-light border-secondary"
                      id="skillsSignup"
                      multiple
                      size="5"
                      value={skills}
                      onChange={handleSkillChange}
                      required
                    >
                      {availableSkills.map((skill, index) => (
                        <option key={index} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="d-grid gap-2 mt-3">
                    <button type="submit" className="btn btn-info btn-lg text-dark">
                      Sign Up
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-light"
                      onClick={() => { setIsSignUp(false); }}
                    >
                      Already have an account? Log In
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!user && !isSignUp && formVisible && (
              <div>
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                  <div className="form-floating">
                    <input 
                      type="email" 
                      className="form-control bg-dark text-light border-secondary" 
                      id="emailLogin"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Email"
                      required 
                    />
                    <label htmlFor="emailLogin" className="text-light">Email address</label>
                  </div>

                  <div className="form-floating">
                    <input 
                      type="password" 
                      className="form-control bg-dark text-light border-secondary" 
                      id="passwordLogin"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Password"
                      required 
                    />
                    <label htmlFor="passwordLogin" className="text-light">Password</label>
                  </div>

                  <div className="d-grid gap-2 mt-3">
                    <button type="submit" className="btn btn-info btn-lg text-dark">
                      Log In
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-light"
                      onClick={() => { setIsSignUp(true); }}
                    >
                      Need an account? Sign Up
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
                )}
              </div>
            }
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;