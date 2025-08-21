import React, { useState, useContext } from 'react';
import axios from 'axios';
import './createAchievement.css';
import { useNavigate, Navigate } from 'react-router-dom';
import { Context } from '../../main';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  FaTrophy, 
  FaHeading, 
  FaAlignLeft, 
  FaTimes, 
  FaSave 
} from 'react-icons/fa';

const CreateAchievement = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context); // Added missing BACKEND_URL
  const navigate = useNavigate();
  const [achievementData, setAchievementData] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  // Moved authAxios inside the component to access BACKEND_URL
  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  // Add interceptor to include token from cookies
  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAchievementData({
      ...achievementData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAxios.post('/api/achievements', achievementData, {
        headers: {
          "Content-Type": "application/json",
        }
      });

      toast.success(data.message || "Achievement created successfully!");
      setAchievementData({
        title: '',
        description: '',
        image: ''
      });

      setTimeout(() => navigate('/about_us'), 1000);
      
    } catch (error) {
      console.error("Creation error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create achievement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-achievement-container">
      <div className="create-achievement-card">
        <div className="card-header">
          <FaTrophy />
          <h2>Create New Achievement</h2>
          <p>Add a new achievement to showcase your accomplishments</p>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="title">
                <FaHeading />
                Achievement Title *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={achievementData.title}
                onChange={handleChange}
                placeholder="Enter achievement title"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width description-group">
              <label htmlFor="description">
                <FaAlignLeft />
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={achievementData.description}
                onChange={handleChange}
                placeholder="Describe the achievement in detail..."
                rows="8"
                required
                disabled={loading}
              />
              <small>Provide a detailed description of the achievement</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="image">
                Image URL
              </label>
              <input
                id="image"
                type="url"
                name="image"
                value={achievementData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                disabled={loading}
              />
              <small>Provide a direct link to the achievement image (optional)</small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/about_us')} 
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
              <span>{loading ? 'Creating...' : 'Create Achievement'}</span>
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
};

export default CreateAchievement;