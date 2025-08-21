import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Context } from '../../main';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserTie, FaUser, FaIdCard, FaUniversity, FaImage, FaTimes, FaSave, FaTrash, FaSpinner } from 'react-icons/fa';
import './Edit_developer.css';

const Edit_developer = () => {
  const { id } = useParams();
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    roll: '',
    dept: '',
    image: '',
    series: '',
    linkedin_url: '',
    github_url: ''
  });

  // Create axios instance with credentials
  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  // Add request interceptor for auth token
  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchDeveloper = async () => {
      try {
        const { data } = await authAxios.get(`/api/dev_team/${id}`);
        if (!data.data) {
          setNotFound(true);
          toast.error('Developer not found');
          return;
        }
        setFormData(data.data);
        toast.success('Developer loaded successfully');
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true);
          toast.error('Developer not found');
        } else {
          console.error("Fetch error:", error);
          toast.error('Failed to load developer');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDeveloper();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { data } = await authAxios.put(`/api/dev_team/${id}`, {
        ...formData,
        series: formData.series,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
      });

      toast.success(data.message || "Developer updated successfully!");
      navigate('/about_us');
    } catch (error) {
      console.error("Error updating developer:", error);
      toast.error(error.response?.data?.message || "Failed to update developer");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this developer? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      const { data } = await authAxios.delete(`/api/dev_team/${id}`);
      toast.success(data.message || 'Developer deleted successfully!');
      setTimeout(() => navigate('/about_us'), 1500);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || 'Failed to delete developer'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate('/about_us');
  };

  if (loading) {
    return (
      <div className="edit-developer-container">
        <div className="loading-card">
          <FaSpinner className="loading-spinner" />
          <h2>Loading Developer...</h2>
          <p>Please wait while we fetch the developer data</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="edit-developer-container">
        <div className="not-found-card">
          <FaUserTie className="not-found-icon" />
          <h2>Developer Not Found</h2>
          <p>The developer you're looking for doesn't exist or may have been deleted.</p>
          <button onClick={() => navigate('/about_us')} className="back-btn">
            <FaTimes />
            <span>Back to About Us</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-developer-container">
      <ToastContainer position="top-right" theme="dark" />
      
      <div className="edit-developer-card">
        <div className="card-header">
          <FaUserTie />
          <h2>Edit Developer</h2>
          <p>Update developer profile and information</p>
        </div>

        <form onSubmit={handleSave} className="edit-form">
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
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter developer's full name"
                required
                disabled={updating || deleting}
              />
              <small>Enter the developer's complete name</small>
            </div>
          </div>

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
                value={formData.roll}
                onChange={handleChange}
                placeholder="Enter roll number (e.g., 1907001)"
                required
                disabled={updating || deleting}
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
                value={formData.dept}
                onChange={handleChange}
                placeholder="Enter department (e.g., CSE, EEE, ECE)"
                required
                disabled={updating || deleting}
              />
              <small>Enter the department name or abbreviation</small>
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
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/profile-image.jpg"
                disabled={updating || deleting}
              />
              <small>Provide a valid URL for the developer's profile image</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="series">
                <FaUserTie />
                Series
              </label>
              <input
                type="text"
                id="series"
                name="series"
                value={formData.series}
                onChange={handleChange}
                placeholder="Enter series (e.g., 2021-2022)"
                disabled={updating || deleting}
              />
              <small>Enter the series the developer belongs to</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="linkedin_url">
                <FaUserTie />
                LinkedIn URL
              </label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/developer"
                disabled={updating || deleting}
              />
              <small>Enter the full LinkedIn profile URL</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="github_url">
                <FaUserTie />
                GitHub URL
              </label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/developer"
                disabled={updating || deleting}
              />
              <small>Enter the full GitHub profile URL</small>
            </div>
          </div>

          {formData.image && (
            <div className="image-preview">
              <label>Current Image Preview:</label>
              <div className="preview-container">
                <img 
                  src={formData.image} 
                  alt="Developer Preview" 
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

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="cancel-btn"
              disabled={updating || deleting}
            >
              <FaTimes />
              <span>Cancel</span>
            </button>
            
            <button 
              type="button" 
              onClick={handleDelete}
              className="delete-btn"
              disabled={updating || deleting}
            >
              <FaTrash />
              <span>{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>
            
            <button 
              type="submit" 
              className="save-btn"
              disabled={updating || deleting}
            >
              <FaSave />
              <span>{updating ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit_developer;