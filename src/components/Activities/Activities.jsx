import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Activities.css';
import { Context } from '../../main'; 

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  // Search state (must be before any conditional returns)
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { BACKEND_URL, isAuthorized } = useContext(Context);

  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });
  

  // Redirect if not authorized (fixes hook order)
  useEffect(() => {
    if (!isAuthorized) {
      navigate('/login');
    }
  }, [isAuthorized, navigate]);

  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await authAxios.get('/api/activities');
        let activitiesData = [];
        
        if (Array.isArray(response.data)) {
          activitiesData = response.data;
        } else if (response.data && Array.isArray(response.data.activities)) {
          activitiesData = response.data.activities;
        } else if (response.data && Array.isArray(response.data.data)) {
          activitiesData = response.data.data;
        }
        
        setActivities(activitiesData);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch activities");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleEdit = (id) => {
    navigate(`/edit_activity/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;

    try {
      await authAxios.delete(`/api/activities/${id}`);
      toast.success("Activity deleted successfully", {
        autoClose: 1000,
        onClose: () => navigate('/')
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete activity");
      console.error("Delete error:", error);
    }
  };

  const truncateDescription = (description) => {
    if (!description) return '';
    const words = description.split(' ');
    return words.length > 30 ? words.slice(0, 30).join(' ') + '...' : description;
  };

  // Categorize activities by event_type
  const groupedActivities = {
    events: activities.filter(activity => activity?.event_type === 'events'),
    projects: activities.filter(activity => activity?.event_type === 'projects'),
    upcoming: activities.filter(activity => activity?.event_type === 'upcoming'),
    workshops: activities.filter(activity => activity?.event_type === 'workshops')
  };

  const handleCreateActivity = () => {
    navigate('/create_activities');
  };


  if (loading) {
    return <div className="activities-container">Loading activities...</div>;
  }

  // Define the order of sections
  const sectionOrder = [
    { key: 'events', label: 'Events' },
    { key: 'projects', label: 'Projects' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'workshops', label: 'Workshops' }
  ];


  // Filtered activities by search
  const filterActivity = (activity) => {
    const q = search.toLowerCase();
    return (
      activity.title?.toLowerCase().includes(q) ||
      activity.description?.toLowerCase().includes(q) ||
      activity.event_type?.toLowerCase().includes(q)
    );
  };

  return (
    <div className="activities-container">
      <ToastContainer />
      <div className="activities-header-stacked">
        <h1>Activities</h1>
        <button className="create-activity-btn-modern" onClick={handleCreateActivity}>
          + Create Activity
        </button>
      </div>
      <div className="activities-search-bar">
        <input
          type="text"
          placeholder="Search activities by title, description, or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="activities-grid">
        {sectionOrder.map(section => (
          <div className="activity-section-card" key={section.key}>
            <h2 className="activity-section-title">{section.label}</h2>
            <div className="activity-card-list">
              {groupedActivities[section.key] && groupedActivities[section.key].filter(filterActivity).length > 0 ? (
                groupedActivities[section.key].filter(filterActivity).map((activity) => (
                  <div key={activity._id} className="activity-card-modern">
                    {activity.image && (
                      <div className="activity-card-image">
                        <img src={activity.image} alt={activity.title} />
                      </div>
                    )}
                    <div className="activity-card-content">
                      <h3>{activity.title}</h3>
                      <p>{truncateDescription(activity.description)}</p>
                      <span className="activity-date">{activity.date}</span>
                    </div>
                    <div className="activity-card-actions">
                      <button className="edit-btn-modern" onClick={() => handleEdit(activity._id)} title="Edit Activity">
                        <i className="fas fa-pen"></i>
                        <span className="btn-text">Edit</span>
                      </button>
                      <button className="delete-btn-modern" onClick={() => handleDelete(activity._id)} title="Delete Activity">
                        <i className="fas fa-trash"></i>
                        <span className="btn-text">Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-activity-msg">No {section.label.toLowerCase()} found</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;