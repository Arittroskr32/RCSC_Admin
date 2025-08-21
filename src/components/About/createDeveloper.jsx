import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Navigate } from 'react-router-dom';
import { Context } from '../../main';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserTie, FaUser, FaImage, FaIdCard, FaUniversity, FaTimes, FaSave } from 'react-icons/fa';
import './createDeveloper.css';

const CreateDeveloper = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [developerData, setDeveloperData] = useState({
    name: '',
    image: '',
    roll: '',
    dept: '',
    series: '',
    linkedin_url: '',
    github_url: ''
  });

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeveloperData({
      ...developerData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAxios.post('/api/dev_team', {
        ...developerData,
        series: developerData.series,
        linkedin_url: developerData.linkedin_url,
        github_url: developerData.github_url,
      });

      toast.success(data.message || "Developer created successfully!");
      setDeveloperData({
        name: '',
        image: '',
        roll: '',
        dept: '',
        series: '',
        linkedin_url: '',
        github_url: '',
      });

      navigate('/about_us');
    } catch (error) {
      console.error("Error creating developer:", error);
      toast.error(error.response?.data?.message || "Failed to create developer");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/about_us');
  };

  return (
    <div className="create-developer-container">
      <ToastContainer position="top-right" theme="dark" />
      
      <div className="create-developer-card">
        <div className="card-header">
          <FaUserTie />
          <h2>Create Developer</h2>
          <p>Add a new developer to the development team</p>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="name">
                <FaUser />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={developerData.name}
                onChange={handleChange}
                placeholder="Enter developer's full name"
                required
                disabled={loading}
              />
              <small>Enter the developer's complete name</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="image">
                <FaImage />
                Profile Image URL
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={developerData.image}
                onChange={handleChange}
                placeholder="https://example.com/profile-image.jpg"
                required
                disabled={loading}
              />
              <small>Provide a valid URL for the developer's profile image</small>
            </div>
          </div>

          {developerData.image && (
            <div className="image-preview">
              <label>Image Preview:</label>
              <div className="preview-container">
                <img 
                  src={developerData.image} 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="preview-error" style={{display: 'none'}}>
                  <FaImage />
                  <span>Invalid image URL</span>
                </div>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="roll">
                <FaIdCard />
                Roll Number
              </label>
              <input
                type="text"
                id="roll"
                name="roll"
                value={developerData.roll}
                onChange={handleChange}
                placeholder="Enter roll number (e.g., 1907001)"
                required
                disabled={loading}
              />
              <small>Enter the student's roll number</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="dept">
                <FaUniversity />
                Department
              </label>
              <input
                type="text"
                id="dept"
                name="dept"
                value={developerData.dept}
                onChange={handleChange}
                placeholder="Enter department (e.g., CSE, EEE, ECE)"
                required
                disabled={loading}
              />
              <small>Enter the department name or abbreviation</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="series">
                <FaIdCard />
                Series
              </label>
              <input
                type="text"
                id="series"
                name="series"
                value={developerData.series}
                onChange={handleChange}
                placeholder="Enter series (e.g., A, B, C)"
                required
                disabled={loading}
              />
              <small>Enter the developer's series</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="linkedin_url">
                <FaUser />
                LinkedIn URL
              </label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={developerData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/developer"
                required
                disabled={loading}
              />
              <small>Enter the URL to the developer's LinkedIn profile</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="github_url">
                <FaUser />
                GitHub URL
              </label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={developerData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/developer"
                required
                disabled={loading}
              />
              <small>Enter the URL to the developer's GitHub profile</small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="cancel-btn"
              disabled={loading}
            >
              <FaTimes />
              <span>Cancel</span>
            </button>
            
            <button 
              type="submit" 
              className="save-btn"
              disabled={loading}
            >
              <FaSave />
              <span>{loading ? 'Creating...' : 'Create Developer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDeveloper;