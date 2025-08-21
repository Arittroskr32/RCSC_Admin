import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Edit_activities.css';
import { Context } from '../../main';

const Edit_activities = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null); // Start with null to distinguish between loading and no data
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { BACKEND_URL, isAuthorized } = useContext(Context);

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

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/login');
      return;
    }

    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response = await authAxios.get(`/api/activities/${id}`);
        
        if (response.data.data) {
          const apiData = response.data.data;
          const formattedData = {
            title: apiData.title || '',
            description: apiData.description || '',
            event_type: apiData.event_type || '', 
            image: apiData.image || apiData.main_image || '', 
            gallery: Array.isArray(apiData.gallery) 
              ? apiData.gallery 
              : (typeof apiData.gallery === 'string' ? apiData.gallery.split(',') : [])
                .map(url => url.trim())
                .filter(url => url)
          };
          setActivity(formattedData);
        } else {
          toast.error("Activity not found");
          navigate('/activities');
        }
      } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Failed to fetch activity");
        navigate('/activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id, isAuthorized, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGalleryChange = (e) => {
    const { value } = e.target;
    const galleryArray = value.split(',').map(url => url.trim()).filter(url => url);
    setActivity(prev => ({
      ...prev,
      gallery: galleryArray
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      
      const activityData = {
        ...activity,
        gallery: activity.gallery.join(',') 
      };

      await authAxios.put(`/api/activities/${id}`, activityData);
      
      toast.success("Activity updated successfully!");
      setTimeout(() => navigate('/activities'), 1000);
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to update activity");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-activity-container">
        <div className="loading-spinner">Loading activity data...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="edit-activity-container">
        <div className="error-message">Failed to load activity data</div>
      </div>
    );
  }

  return (
    <div className="edit-activity-container-modern">
      <div className="edit-activity-card">
        <ToastContainer />
        <div className="edit-activity-header">
          <span role="img" aria-label="edit" className="activity-icon">📝</span>
          <h2>Edit Activity</h2>
        </div>
        <form onSubmit={handleSubmit} className="edit-activity-form-modern">
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
                placeholder="Enter activity description"
                required
                minLength="10"
                rows="5"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="image">Main Image URL</label>
              <input
                type="text"
                id="image"
                name="image"
                value={activity.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="form-group">
              <label htmlFor="gallery">Gallery Image URLs (comma separated)</label>
              <input
                type="text"
                id="gallery"
                name="gallery"
                value={activity.gallery.join(', ')}
                onChange={handleGalleryChange}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="submit-btn-modern"
            disabled={formLoading}
          >
            {formLoading ? 'Updating...' : 'Update Activity'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Edit_activities;