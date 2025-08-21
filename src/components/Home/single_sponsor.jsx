import React, { useState, useEffect, useContext } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Context } from '../../main';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  FaBuilding, 
  FaImage, 
  FaTimes, 
  FaTrash, 
  FaSave 
} from 'react-icons/fa';
import "./single_sponsor.css";

const SingleSponsor = () => {
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
    name: '',
    logo_url: ''
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
    const fetchSponsor = async () => {
      try {
        setLoading(prev => ({...prev, fetch: true}));
        const { data } = await authAxios.get(`/api/sponsors/${id}`);
        
        if (!data.data) {
          setNotFound(true);
          return;
        }
        
        setFormData(data.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(error.response?.data?.message || "Failed to fetch sponsor");
          console.error("Fetch error:", error);
        }
      } finally {
        setLoading(prev => ({...prev, fetch: false}));
      }
    };

    fetchSponsor();
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
      const { data } = await authAxios.put(`/api/sponsors/${id}`, formData);
      toast.success(data.message || "Sponsor updated successfully");
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update sponsor");
    } finally {
      setLoading(prev => ({...prev, save: false}));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this sponsor?")) {
      return;
    }

    try {
      setLoading(prev => ({...prev, delete: true}));
      await authAxios.delete(`/api/sponsors/${id}`);
      toast.success("Sponsor deleted successfully");
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete sponsor");
    } finally {
      setLoading(prev => ({...prev, delete: false}));
    }
  };

  if (loading.fetch) {
    return (
      <div className="edit-sponsor-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading sponsor...</p>
        </div>
      </div>
    );
  }

  if (notFound || (!formData.name && !loading.fetch)) {
    return (
      <div className="edit-sponsor-container">
        <div className="error-state">
          <h2>Sponsor Not Found</h2>
          <p>The sponsor you're looking for doesn't exist or has been deleted.</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-sponsor-container">
      <div className="edit-sponsor-card">
        <div className="card-header">
          <h2>Edit Sponsor</h2>
          <p>Update sponsor details below</p>
        </div>

        <form onSubmit={handleSave} className="edit-form">
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="name">
                <FaBuilding />
                Sponsor Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter sponsor name"
                required
                disabled={loading.save || loading.delete}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="logo_url">
                <FaImage />
                Logo URL *
              </label>
              <input
                id="logo_url"
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                required
                disabled={loading.save || loading.delete}
              />
              {formData.logo_url && (
                <div className="logo-preview">
                  <img 
                    src={formData.logo_url} 
                    alt="Logo Preview" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      e.target.style.display = 'block';
                    }}
                  />
                </div>
              )}
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

export default SingleSponsor;