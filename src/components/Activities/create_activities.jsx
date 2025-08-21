import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./create_activities.css";
import { Context } from '../../main';

const CreateActivities = () => {
  const [activity, setActivity] = useState({
    title: '',
    description: '',
    event_type: '',
    image: '', // Single image URL
    gallery: ''    // Comma-separated image URLs
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { BACKEND_URL, isAuthorized } = useContext(Context);

  // Create authenticated axios instance
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthorized) {
      toast.error("You must be logged in to create activities");
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      if (!activity.image) {
        throw new Error("Please provide a main image URL");
      }

      const response = await authAxios.post('/api/activities', {
        ...activity,
        gallery: activity.gallery.split(',').map(url => url.trim()).filter(url => url)
      });
      
      toast.success("Activity created successfully!");
      setTimeout(() => navigate('/activities'), 1500);
      
    } catch (error) {
      console.error("Create activity error:", error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Failed to create activity";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const galleryUrls = activity.gallery.split(',').map(url => url.trim()).filter(url => url);

  return (
    <div className="create-activity-container-modern">
      <ToastContainer />
      <div className="create-activity-card">
        <div className="create-activity-header">
          <span role="img" aria-label="activity" className="activity-icon">🎯</span>
          <h2>Create New Activity</h2>
        </div>
        <form onSubmit={handleSubmit} className="create-activity-form-modern">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Activity Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={activity.title}
                onChange={handleChange}
                placeholder="Enter activity title"
                required
                minLength="3"
                maxLength="100"
              />
            </div>
            <div className="form-group">
              <label htmlFor="event_type">Event Type*</label>
              <select
                id="event_type"
                name="event_type"
                value={activity.event_type}
                onChange={handleChange}
                required
              >
                <option value="">Select event type</option>
                <option value="events">Events</option>
                <option value="projects">Projects</option>
                <option value="upcoming">Upcoming</option>
                <option value="workshops">Workshops</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="description">Activity Description*</label>
              <textarea
                id="description"
                name="description"
                value={activity.description}
                onChange={handleChange}
                placeholder="Enter detailed description"
                required
                minLength="10"
                rows="5"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="main_image">Main Image URL*</label>
              <input
                type="text"
                id="main_image"
                name="image"
                value={activity.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="gallery">Gallery Image URLs (comma separated)</label>
              <input
                type="text"
                id="gallery"
                name="gallery"
                value={activity.gallery}
                onChange={handleChange}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="submit-btn-modern"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Activity'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateActivities;