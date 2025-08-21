import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Context } from '../../main';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrophy, FaRegEdit, FaRegFileAlt, FaTimes, FaSave, FaTrash, FaSpinner } from 'react-icons/fa';
import './EditAchievement.css';

const EditAchievement = () => {
  const { id } = useParams();
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
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
    const fetchAchievement = async () => {
      try {
        const { data } = await authAxios.get(`/api/achievements/${id}`);
        if (!data.data) {
          setNotFound(true);
          toast.error('Achievement not found');
          return;
        }
        setFormData({
          title: data.data.title || '',
          description: data.data.description || '',
          image: data.data.image || ''
        });
        toast.success('Achievement loaded successfully');
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true);
          toast.error('Achievement not found');
        } else {
          console.error("Fetch error:", error);
          toast.error('Failed to load achievement');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAchievement();
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
      const { data } = await authAxios.put(`/api/achievements/${id}`, formData);
      toast.success(data.message || 'Achievement updated successfully!');
      setTimeout(() => navigate('/about_us'), 1500);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error.response?.data?.message || 'Failed to update achievement'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this achievement? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      const { data } = await authAxios.delete(`/api/achievements/${id}`);
      toast.success(data.message || 'Achievement deleted successfully!');
      setTimeout(() => navigate('/about_us'), 1500);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || 'Failed to delete achievement'
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
      <div className="edit-achievement-container">
        <div className="loading-card">
          <FaSpinner className="loading-spinner" />
          <h2>Loading Achievement...</h2>
          <p>Please wait while we fetch the achievement data</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="edit-achievement-container">
        <div className="not-found-card">
          <FaTrophy className="not-found-icon" />
          <h2>Achievement Not Found</h2>
          <p>The achievement you're looking for doesn't exist or may have been deleted.</p>
          <button onClick={() => navigate('/about_us')} className="back-btn">
            <FaTimes />
            <span>Back to About Us</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-achievement-container">
      <ToastContainer position="top-right" theme="dark" />
      
      <div className="edit-achievement-card">
        <div className="card-header">
          <FaTrophy />
          <h2>Edit Achievement</h2>
          <p>Update achievement information and details</p>
        </div>

        <form onSubmit={handleSave} className="edit-form">
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="title">
                <FaRegEdit />
                Achievement Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter achievement title"
                required
                disabled={updating || deleting}
              />
              <small>Enter a clear and descriptive title for the achievement</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width description-group">
              <label htmlFor="description">
                <FaRegFileAlt />
                Achievement Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the achievement in detail..."
                rows="8"
                required
                disabled={updating || deleting}
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
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                disabled={updating || deleting}
              />
              <small>Provide a direct link to the achievement image (optional)</small>
            </div>
          </div>

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

export default EditAchievement;