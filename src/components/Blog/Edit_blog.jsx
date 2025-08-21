import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Edit_blog.css';
import { Context } from '../../main';

const Edit_blog = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { BACKEND_URL, isAuthorized } = useContext(Context);
  const [currentBlog, setCurrentBlog] = useState({
    title: '',
    description: '',
    author: '',
    image: '',
    tags: [],
    // likes: 0, // removed like field
    date: ''
  });
  const [loading, setLoading] = useState(true);

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

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await authAxios.get(`/api/blogs/get_blogs/${blogId}`);
        setCurrentBlog({
          ...response.data.data,
          tags: response.data.data.tags || []
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch blog");
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlog();
  }, [isAuthorized, navigate]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const blogToSubmit = {
        ...currentBlog,
        date: new Date(currentBlog.date).toISOString()
      };
      
      await authAxios.put(`/api/blogs/update_blog/${blogId}`, blogToSubmit);
      toast.success("Blog updated successfully!");
      setTimeout(() => navigate('/blog'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    
    try {
      setLoading(true);
      await authAxios.delete(`/api/blogs/delete_blog/${blogId}`);
      toast.success("Blog deleted successfully!");
      setTimeout(() => navigate('/blog'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete blog");
    } finally {
      setLoading(false);
    }
  };

  // Like logic removed

  const handleTagsChange = (e) => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setCurrentBlog({ ...currentBlog, tags: tagsArray });
  };

  if (loading) return <div className="edit-blog">Loading...</div>;

  return (
    <div className="edit-blog">
      <ToastContainer />
      <h2>Edit Blog</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title*</label>
          <input
            type="text"
            value={currentBlog.title}
            onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description*</label>
          <textarea
            value={currentBlog.description}
            onChange={(e) => setCurrentBlog({ ...currentBlog, description: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Author*</label>
          <input
            type="text"
            value={currentBlog.author}
            onChange={(e) => setCurrentBlog({ ...currentBlog, author: e.target.value })}
            required
          />
        </div>
        {/* Like field removed */}
        
        <div className="form-group">
          <label>Image URL</label>
          <input
            type="text"
            value={currentBlog.image}
            onChange={(e) => setCurrentBlog({ ...currentBlog, image: e.target.value })}
          />
          {currentBlog.image && (
            <img src={currentBlog.image} alt="Preview" className="image-preview" />
          )}
        </div>
        
        <div className="form-group">
          <label>Tags (Comma separated)</label>
          <input
            type="text"
            value={currentBlog.tags.join(', ')}
            onChange={handleTagsChange}
            placeholder="tag1, tag2, tag3"
          />
        </div>
        <div className="form-group">
          <label>Date*</label>
          <input
            type="date"
            value={formatDateForInput(currentBlog.date)}
            onChange={(e) => setCurrentBlog({ ...currentBlog, date: e.target.value })}
            required
          />
        </div>

        <div className="button-group">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            onClick={handleDelete} 
            className="delete-btn"
            disabled={loading}
          >
            Delete Blog
          </button>
        </div>
      </form>
    </div>
  );
};

export default Edit_blog;
