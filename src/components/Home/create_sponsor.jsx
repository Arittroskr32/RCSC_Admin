import React, { useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Context } from '../../main';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './create_sponsor.css';

const CreateSponsor = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    logo_url: ''
  });
  const [loading, setLoading] = useState(false);

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
      const { data } = await authAxios.post('/api/sponsors', formData);
      
      toast.success(data.message || "Sponsor created successfully");
      setFormData({
        name: '',
        logo_url: ''
      });
      
      // Redirect after 2 seconds
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create sponsor");
      console.error("Creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-sponsor-container">
      <ToastContainer />
      <h2>Create Sponsor</h2>
      <form onSubmit={handleSubmit} className="sponsor-form">
        <div className="form-group">
          <label htmlFor="name">Sponsor Name</label>
          <input 
            type="text" 
            id="name" 
            name="name"
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Enter sponsor name"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="logo_url">Logo URL</label>
          <input 
            type="url" 
            id="logo_url" 
            name="logo_url"
            value={formData.logo_url} 
            onChange={handleChange} 
            placeholder="Enter logo URL"
            required
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Sponsor'}
        </button>
      </form>
    </div>
  );
};

export default CreateSponsor;