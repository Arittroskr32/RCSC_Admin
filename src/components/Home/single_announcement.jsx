import React, { useState, useEffect, useContext } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Context } from '../../main';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  FaHeading, 
  FaImage, 
  FaAlignLeft, 
  FaExternalLinkAlt, 
  FaTags, 
  FaTimes, 
  FaTrash, 
  FaSave 
} from 'react-icons/fa';
import "./single_announcement.css";

const SingleAnnouncement = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState({
    fetch: true,
    save: false,
    delete: false
  });
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    post_url: '',
    tags: '',
    date: ''
  });

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

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(prev => ({...prev, fetch: true}));
        const { data } = await authAxios.get(`/api/announcement/${id}`);
        
        if (!data.data) {
          setNotFound(true);
          return;
        }
        
        const formattedData = {
          ...data.data,
          tags: Array.isArray(data.data.tags) ? data.data.tags.join(', ') : data.data.tags || ''
        };
        
        setFormData(formattedData);
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(error.response?.data?.message || "Failed to fetch announcement");
          console.error("Fetch error:", error);
        }
      } finally {
        setLoading(prev => ({...prev, fetch: false}));
      }
    };

    fetchAnnouncement();
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
    setLoading(prev => ({...prev, save: true}));

    try {
      // Prepare data for submission
      const submissionData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const { data } = await authAxios.put(`/api/announcement/${id}`, submissionData);
      toast.success(data.message || "Announcement updated successfully");
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update announcement");
    } finally {
      setLoading(prev => ({...prev, save: false}));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      setLoading(prev => ({...prev, delete: true}));
      await authAxios.delete(`/api/announcement/${id}`);
      toast.success("Announcement deleted successfully");
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete announcement");
    } finally {
      setLoading(prev => ({...prev, delete: false}));
    }
  };

  if (loading.fetch) {
    return (
      <div className="edit-announcement-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading announcement...</p>
        </div>
      </div>
    );
  }

  if (notFound || (!formData.title && !loading.fetch)) {
    return (
      <div className="edit-announcement-container">
        <div className="error-state">
          <h2>Announcement Not Found</h2>
          <p>The announcement you're looking for doesn't exist or has been deleted.</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-announcement-container">
      <div className="edit-announcement-card">
        <div className="card-header">
          <h2>Edit Announcement</h2>
          <p>Update your announcement details below</p>
        </div>

        <form onSubmit={handleSave} className="edit-form">
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="title">
                <FaHeading />
                Title *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter announcement title"
                required
                disabled={loading.save || loading.delete}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="image">
                <FaImage />
                Featured Image URL
              </label>
              <input
                id="image"
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                disabled={loading.save || loading.delete}
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
                value={formData.description}
                onChange={handleChange}
                placeholder="Write your announcement description..."
                rows="12"
                required
                disabled={loading.save || loading.delete}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="post_url">
                <FaExternalLinkAlt />
                Post URL
              </label>
              <input
                id="post_url"
                type="url"
                name="post_url"
                value={formData.post_url}
                onChange={handleChange}
                placeholder="https://example.com/post"
                disabled={loading.save || loading.delete}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="tags">
                <FaTags />
                Tags
              </label>
              <input
                id="tags"
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="cybersecurity, technology, news"
                disabled={loading.save || loading.delete}
              />
              <small>Separate tags with commas</small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="cancel-btn"
              disabled={loading.save || loading.delete}
            >
              <FaTimes />
              <span>Cancel</span>
            </button>
            <button 
              type="button" 
              onClick={handleDelete} 
              className="delete-btn"
              disabled={loading.save || loading.delete}
            >
              <FaTrash />
              <span>{loading.delete ? 'Deleting...' : 'Delete'}</span>
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={loading.save || loading.delete}
            >
              <FaSave />
              <span>{loading.save ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
};

export default SingleAnnouncement;