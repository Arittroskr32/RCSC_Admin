import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Context } from '../../main';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddMember.css';

const EditDeveloper = () => {
  const { BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const { id } = useParams();
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
    const fetchDeveloper = async () => {
      try {
        setLoading(true);
        const { data } = await authAxios.get(`/api/members/getmember/${id}`);
        setFormData(data.data);
      } catch (error) {
        console.error('Error fetching developer:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch developer');
      } finally {
        setLoading(false);
      }
    };

    fetchDeveloper();
  }, [id]);

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
      const { data } = await authAxios.put(`/api/members/updatemember/${id}`, {
        ...formData,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        series: formData.series,
      });
      toast.success(data.message || 'Developer updated successfully!');
      navigate('/about_us');
    } catch (error) {
      console.error('Error updating developer:', error);
      toast.error(error.response?.data?.message || 'Failed to update developer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-member-container">
      <ToastContainer />
      <h2>Edit Developer</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          type="text"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="Image URL"
          required
        />
        <input
          type="text"
          name="post"
          value={formData.post}
          onChange={handleChange}
          placeholder="Post"
          required
        />
        <input
          type="text"
          name="roll"
          value={formData.roll}
          onChange={handleChange}
          placeholder="Roll"
          required
        />
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="Department"
          required
        />
        <input
          type="text"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          placeholder="Contact"
          required
        />
        <input
          type="text"
          name="series"
          value={formData.series}
          onChange={handleChange}
          placeholder="Series"
          required
        />
        <input
          type="text"
          name="linkedin_url"
          value={formData.linkedin_url}
          onChange={handleChange}
          placeholder="LinkedIn URL"
          required
        />
        <input
          type="text"
          name="github_url"
          value={formData.github_url}
          onChange={handleChange}
          placeholder="GitHub URL"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Developer'}
        </button>
      </form>
    </div>
  );
};

export default EditDeveloper;
