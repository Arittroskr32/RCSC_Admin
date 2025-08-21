import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../main';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddMember.css';

const AddMember = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    post: '',
    roll: '',
    department: '',
    contact: '',
    series: '',
    linkedin_url: '',
    github_url: '',
    committee: 'new',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAxios.post('/api/members/addmember', {
        ...formData,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        series: formData.series,
      });

      toast.success(data.message || 'Developer added successfully!');

      // Reset form after successful submission
      setFormData({
        name: '',
        image_url: '',
        post: '',
        roll: '',
        department: '',
        contact: '',
        series: '',
        linkedin_url: '',
        github_url: '',
        committee: 'new',
      });

      navigate('/about_us');
    } catch (error) {
      console.error('Error adding developer:', error);
      toast.error(error.response?.data?.message || 'Failed to add developer');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return null; // Redirect handled by parent
  }

  return (
    <div className="add-member-container">
      <ToastContainer />
      <h2>Add Member</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Arittro Sarkar"
            required
            disabled={loading}
          />
        </label>
        <label>
          Image URL:
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="e.g. https://example.com/image.jpg"
            required
            disabled={loading}
          />
        </label>
        <label>
          Post:
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              name="post"
              value={formData.post}
              onChange={handleChange}
              placeholder="e.g. Administrative Operations Manager"
              disabled={loading}
              style={{ flex: 1 }}
            />
            <select
              name="post"
              value={formData.post}
              onChange={handleChange}
              disabled={loading}
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
        </label>
        <label>
          Roll:
          <input
            type="text"
            name="roll"
            value={formData.roll}
            onChange={handleChange}
            placeholder="e.g. 2103003"
            required
            disabled={loading}
          />
        </label>
        <label>
          Department:
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g. CSE"
            required
            disabled={loading}
          />
        </label>
        <label>
          Contact:
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="e.g. 01319392932"
            required
            disabled={loading}
          />
        </label>
        <label>
          Series:
          <input
            type="text"
            name="series"
            value={formData.series}
            onChange={handleChange}
            placeholder="e.g. 21"
            required
            disabled={loading}
          />
        </label>
        <label>
          LinkedIn URL:
          <input
            type="url"
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleChange}
            placeholder="e.g. https://www.linkedin.com/in/yourprofile"
            disabled={loading}
          />
        </label>
        <label>
          GitHub URL:
          <input
            type="url"
            name="github_url"
            value={formData.github_url}
            onChange={handleChange}
            placeholder="e.g. https://github.com/yourprofile"
            disabled={loading}
          />
        </label>
        <label>
          Committee:
          <select
            name="committee"
            value={formData.committee}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="new">Current Committee</option>
            <option value="old">Previous Committee</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Member'}
        </button>
      </form>
    </div>
  );
};

export default AddMember;