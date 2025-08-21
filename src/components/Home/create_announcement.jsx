import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { Context } from '../../main';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './create_announcement.css';

const CreateAnnouncement = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    post_url: '',
    tags: '',
    author: 'Admin',
    read_time: '2 min'
  });
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process tags from comma-separated string to array
      const processedData = {
        ...formData,
        image_url: formData.image, // Set image_url to the same as image
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      const { data } = await authAxios.post('/api/announcement', processedData, {
        headers: {
          "Content-Type": "application/json",
        }
      });

      toast.success(data.message || "Announcement created successfully");
      setFormData({
        title: '',
        description: '',
        image: '',
        post_url: '',
        tags: '',
        author: 'Admin',
        read_time: '2 min'
      });

      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create announcement");
      console.error("Creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-announcement-container">
      <ToastContainer />
      <h2>Create Announcement</h2>
      <form onSubmit={handleSubmit} className="announcement-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input 
            type="text" 
            id="title" 
            name="title"
            value={formData.title} 
            onChange={handleChange} 
            placeholder="Enter title"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea 
            id="description" 
            name="description"
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Enter description"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input 
            type="text" 
            id="image" 
            name="image"
            value={formData.image} 
            onChange={handleChange} 
            placeholder="Enter image URL"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="post_url">Link</label>
          <input 
            type="url" 
            id="post_url" 
            name="post_url"
            value={formData.post_url} 
            onChange={handleChange} 
            placeholder="Enter post URL"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input 
            type="text" 
            id="tags" 
            name="tags"
            value={formData.tags} 
            onChange={handleChange} 
            placeholder="e.g., cybersecurity, JWT, web-hacking"
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input 
              type="text" 
              id="author" 
              name="author"
              value={formData.author} 
              onChange={handleChange} 
              placeholder="Author name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="read_time">Read Time</label>
            <input 
              type="text" 
              id="read_time" 
              name="read_time"
              value={formData.read_time} 
              onChange={handleChange} 
              placeholder="e.g., 2 min"
              disabled={loading}
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Announcement'}
        </button>
      </form>
    </div>
  );
};

export default CreateAnnouncement;