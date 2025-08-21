import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from '../../main';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Member_display.css';

const Member_display = () => {
  const { id } = useParams();
  const { BACKEND_URL, isAuthorized } = useContext(Context);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Create authenticated axios instance
  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
    }
  }, [isAuthorized, navigate]);

  // Add request interceptor for auth token
  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    if (!id) {
      setError('Member ID is missing from the URL!');
      toast.error('Member ID is missing!');
      navigate('/error');
      return;
    }

    const fetchMember = async () => {
      try {
        const { data } = await authAxios.get(`/api/members/getmember/${id}`);
        setFormData(data.data);
      } catch (err) {
        console.error('Error fetching member:', err);
        setError(err.response?.data?.message || 'Failed to fetch member');
        toast.error(err.response?.data?.message || 'Failed to fetch member');
        navigate('/error');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await authAxios.put(`/api/members/updatemember/${id}`, formData);
      toast.success('Member updated successfully!');
      setTimeout(() => {
        navigate('/member');
      }, 1000); // 1 second delay
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(err.response?.data?.message || 'Update failed!');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this member?');
    if (confirmDelete) {
      try {
        await authAxios.delete(`/api/members/deletemember/${id}`);
        toast.success('Member deleted successfully!');
        setTimeout(() => {
          navigate('/member');
        }, 1000); // 1 second delay
      } catch (err) {
        console.error('Delete failed:', err);
        toast.error(err.response?.data?.message || 'Delete failed!');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!formData) return <div className="error">Member not found</div>;

  return (
    <div className="member-display-container-modern">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="member-card-modern">
        <div className="member-avatar-section">
          <div className="member-avatar">
            {formData.image_url ? (
              <img src={formData.image_url} alt={formData.name} />
            ) : (
              <span className="avatar-placeholder">{formData.name?.charAt(0) || '?'}</span>
            )}
          </div>
          <div className="member-main-info">
            <h2>{formData.name}</h2>
            <p className="member-post">{formData.post}</p>
            <p className="member-committee">{formData.committee === 'new' ? 'Current Committee' : 'Previous Committee'}</p>
          </div>
        </div>
        <form onSubmit={handleUpdate} className="member-form-modern">
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Post</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  name="post"
                  value={formData.post || ''}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                />
                <select
                  name="post"
                  value={formData.post || ''}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                >
                  <option value="">Select from list</option>
                  <option value="Advisor">Advisor</option>
                  <option value="President">President</option>
                  <option value="Vice President (Administrator)">Vice President (Administrator)</option>
                  <option value="Vice President (Technical)">Vice President (Technical)</option>
                  <option value="General Secretary">General Secretary</option>
                  <option value="Joint Secretary (Administration)">Joint Secretary (Administration)</option>
                  <option value="Joint Secretary (Planning)">Joint Secretary (Planning)</option>
                  <option value="Organizing Lead">Organizing Lead</option>
                  <option value="Administrative Operations Manager">Administrative Operations Manager</option>
                  <option value="Creative Director">Creative Director</option>
                  <option value="CTF and Training Programs Lead">CTF and Training Programs Lead</option>
                  <option value="Brand Strategy and Engagement Lead">Brand Strategy and Engagement Lead</option>
                  <option value="Finance Strategist">Finance Strategist</option>
                  <option value="Research and Development Strategist">Research and Development Strategist</option>
                </select>
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input type="text" name="department" value={formData.department || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Roll</label>
              <input type="text" name="roll" value={formData.roll || ''} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Contact</label>
              <input type="text" name="contact" value={formData.contact || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Series</label>
              <input type="text" name="series" value={formData.series || ''} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Image URL</label>
              <input type="text" name="image_url" value={formData.image_url || ''} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Committee</label>
              <select name="committee" value={formData.committee || 'new'} onChange={handleChange}>
                <option value="new">Current Committee</option>
                <option value="old">Previous Committee</option>
              </select>
            </div>
          </div>
          <div className="button-group-modern">
            <button type="submit" className="update-button-modern">Update Information</button>
            <button type="button" onClick={handleDelete} className="delete-button-modern">Delete Member</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Member_display;