import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Navigate } from 'react-router-dom';
import { Context } from '../../main';
import { FaEdit, FaUsers, FaBullhorn, FaHandshake, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState({});

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
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [announcementRes, sponsorRes] = await Promise.all([
          authAxios.get('/api/announcement'),
          authAxios.get('/api/sponsors')
        ]);
        setAnnouncements(announcementRes.data.announcements || []);
        setSponsors(sponsorRes.data.sponsors || []);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch data");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthorized, navigate]);

  const toggleDescription = (id) => {
    setExpandedAnnouncements((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
    <div className="home-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>RCSC Admin Dashboard</h1>
          <p>Welcome to the RUET Cyber Security Club Administration Panel</p>
        </div>
        <div className="quick-stats">
          <div className="stat-card">
            <FaBullhorn className="stat-icon" />
            <div className="stat-info">
              <span className="stat-number">{announcements.length}</span>
              <span className="stat-label">Announcements</span>
            </div>
          </div>
          <div className="stat-card">
            <FaHandshake className="stat-icon" />
            <div className="stat-info">
              <span className="stat-number">{sponsors.length}</span>
              <span className="stat-label">Sponsors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Sponsors Section */}
        <div className="content-section sponsor-section">
          <div className="section-header">
            <div className="section-title">
              <FaHandshake className="section-icon" />
              <h2>Our Sponsors</h2>
            </div>
            <button className="create-btn secondary" onClick={() => navigate('/create_sponsor')}>
              <FaPlus className="btn-icon" />
              Add Sponsor
            </button>
          </div>
          
          <div className="sponsor-grid">
            {sponsors.length > 0 ? (
              sponsors.map((sponsor) => (
                <div key={sponsor._id} className="sponsor-card">
                  <div className="sponsor-logo-container">
                    {sponsor.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        className="sponsor-logo"
                      />
                    ) : (
                      <div className="sponsor-placeholder">
                        <FaHandshake />
                      </div>
                    )}
                  </div>
                  <div className="sponsor-info">
                    <h3>{sponsor.name}</h3>
                    <FaEdit
                      className="edit-icon"
                      onClick={() => navigate(`/edit_sponsor/${sponsor._id}`)}
                      aria-label="Edit sponsor"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaHandshake className="empty-icon" />
                <h3>No Sponsors Yet</h3>
                <p>Add sponsors to showcase your partnerships</p>
                <button className="create-btn secondary" onClick={() => navigate('/create_sponsor')}>
                  <FaPlus className="btn-icon" />
                  Add Sponsor
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Announcements Section */}
        <div className="content-section announcement-section">
          <div className="section-header">
            <div className="section-title">
              <FaBullhorn className="section-icon" />
              <h2>Recent Announcements</h2>
            </div>
            <button className="create-btn primary" onClick={() => navigate('/create_announcement')}>
              <FaPlus className="btn-icon" />
              Create Announcement
            </button>
          </div>
          <div className="announcement-search-bar">
            <input
              type="text"
              placeholder="Search announcements by title or tag..."
              value={announcementSearch}
              onChange={e => setAnnouncementSearch(e.target.value)}
            />
          </div>
          <div className="announcement-grid">
            {announcements.length > 0 ? (
              announcements
                .filter(a =>
                  a.title.toLowerCase().includes(announcementSearch.toLowerCase()) ||
                  (Array.isArray(a.tags) && a.tags.some(tag => tag.toLowerCase().includes(announcementSearch.toLowerCase())))
                )
                .slice(0, 6)
                .map((announcement) => (
                <div 
                  key={announcement._id} 
                  className="announcement-blog-card"
                  onClick={() => navigate(`/edit_announcement/${announcement._id}`)}
                >
                  <div className="blog-card-image">
                    {announcement.image_url || announcement.image ? (
                      <img 
                        src={announcement.image_url || announcement.image} 
                        alt={announcement.title}
                        className="announcement-image"
                      />
                    ) : (
                      <div className="announcement-placeholder">
                        <FaBullhorn className="placeholder-icon" />
                        <span className="category-tag">Announcement</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="blog-card-content">
                    <h3 className="blog-card-title">{announcement.title}</h3>
                    <p className="blog-card-description">
                      {announcement.description.length > 150 
                        ? `${announcement.description.substring(0, 150)}...`
                        : announcement.description}
                    </p>
                    
                    {announcement.tags && announcement.tags.length > 0 && (
                      <div className="blog-card-tags">
                        {announcement.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="blog-card-footer">
                      <div className="blog-card-meta">
                        <span className="author">By {announcement.author || 'Admin'}</span>
                        <span className="read-time">{announcement.read_time || '2 min'}</span>
                      </div>
                      <div className="blog-card-stats">
                        <span className="views">{announcement.views || 0}</span>
                        <span className="likes">♥ {announcement.likes || 0}</span>
                      </div>
                    </div>
                    
                    <div className="blog-card-date">
                      {new Date(announcement.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state full-width">
                <FaBullhorn className="empty-icon" />
                <h3>No Announcements Yet</h3>
                <p>Create your first announcement to get started</p>
                <button className="create-btn primary" onClick={() => navigate('/create_announcement')}>
                  <FaPlus className="btn-icon" />
                  Create Announcement
                </button>
              </div>
            )}
          </div>
          
          {announcements.length > 6 && (
            <div className="view-all">
              <button className="view-all-btn" onClick={() => navigate('/announcements')}>
                View All Announcements ({announcements.length})
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="content-section quick-actions">
          <div className="section-header">
            <div className="section-title">
              <h2>Quick Actions</h2>
            </div>
          </div>
          
          <div className="action-grid">
            <button className="action-card" onClick={() => navigate('/all-club-members')}>
              <FaUsers className="action-icon" />
              <div className="action-content">
                <h3>Club Members</h3>
                <p>Manage club member information</p>
              </div>
            </button>
            <button className="action-card" onClick={() => navigate('/newsletter')}>
              <FaBullhorn className="action-icon" />
              <div className="action-content">
                <h3>Newsletter</h3>
                <p>View subscribers & send styled newsletter</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
