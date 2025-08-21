import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './About.css';
import { 
  FaTrophy, 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaGithub, 
  FaLinkedin, 
  FaEnvelope 
} from 'react-icons/fa';
import { Context } from '../../main'; 

const About = () => {
  const { BACKEND_URL, isAuthorized } = useContext(Context);
  const [achievements, setAchievements] = useState([]);
  const [achievementSearch, setAchievementSearch] = useState("");
  const [developerTeam, setDeveloperTeam] = useState([]);
  const [expandedAchievementId, setExpandedAchievementId] = useState(null);
  const [loading, setLoading] = useState({
    achievements: false,
    developers: false
  });
  const navigate = useNavigate();

  if(!isAuthorized){
    navigate('/login');
  }

  // Fetch achievements
  const fetchAchievements = async () => {
    setLoading(prev => ({...prev, achievements: true}));
    try {
      const response = await axios.get(`${BACKEND_URL}/api/achievements`);
      setAchievements(Array.isArray(response.data.achievements) ? response.data.achievements : []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(prev => ({...prev, achievements: false}));
    }
  };

  // Fetch developers
  const fetchDevelopers = async () => {
    setLoading(prev => ({...prev, developers: true}));
    try {
      const response = await axios.get(`${BACKEND_URL}/api/dev_team`);
      setDeveloperTeam(Array.isArray(response.data.devTeam) ? response.data.devTeam : []);
    } catch (error) {
      console.error("Error fetching developers:", error);
    } finally {
      setLoading(prev => ({...prev, developers: false}));
    }
  };

  useEffect(() => {
    fetchAchievements();
    fetchDevelopers();
  }, []);

  const toggleDescription = (id) => {
    setExpandedAchievementId(expandedAchievementId === id ? null : id);
  };

  const handleCreateAchievement = () => {
    navigate('/create_achievement');
  };

  const handleCreateDeveloper = () => {
    navigate('/create_developer');
  };

  const openEditPage = (type, id) => {
    if (type === 'achievement') {
      navigate(`/edit_achievement/${id}`);
    } else if (type === 'developer_team') {
      navigate(`/edit_developer/${id}`);
    }
  };

  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Us Management</h1>
        <p>Manage achievements and developer team information</p>
      </div>

      {/* Create Actions */}
      <div className="create-actions">
        <button onClick={handleCreateAchievement} className="create-btn achievement-btn">
          <FaPlus />
          <span>Create Achievement</span>
        </button>
        <button onClick={handleCreateDeveloper} className="create-btn developer-btn">
          <FaPlus />
          <span>Create Developer</span>
        </button>
      </div>

      {/* Achievements Section */}
      <div className="section">
        <div className="section-header">
          <FaTrophy />
          <h2>Achievements</h2>
          <span className="count-badge">{achievements.length}</span>
        </div>
        <div className="achievement-search-bar">
          <input
            type="text"
            placeholder="Search achievements by title..."
            value={achievementSearch}
            onChange={e => setAchievementSearch(e.target.value)}
          />
        </div>
        {loading.achievements ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading achievements...</p>
          </div>
        ) : (
          <div className="content-grid">
            {achievements.length > 0 ? (
              achievements
                .filter(a => a.title.toLowerCase().includes(achievementSearch.toLowerCase()))
                .map((achievement) => (
                <div key={achievement._id} className="content-card achievement-card">
                  <div className="card-header">
                    <h3>{achievement.title}</h3>
                    <div className="card-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => toggleDescription(achievement._id)}
                        title={expandedAchievementId === achievement._id ? 'Show Less' : 'Show More'}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => openEditPage('achievement', achievement._id)}
                        title="Edit Achievement"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <p className={`description ${expandedAchievementId === achievement._id ? 'expanded' : 'collapsed'}`}>
                      {expandedAchievementId === achievement._id
                        ? achievement.description
                        : `${achievement.description.split(' ').slice(0, 20).join(' ')}...`}
                    </p>
                  </div>
                  
                  <div className="card-footer">
                    <span className="created-date">
                      {new Date(achievement.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaTrophy />
                <h3>No achievements found</h3>
                <p>Create your first achievement to get started</p>
                <button onClick={handleCreateAchievement} className="empty-action-btn">
                  <FaPlus />
                  Create Achievement
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Developer Team Section */}
      <div className="section">
        <div className="section-header">
          <FaUsers />
          <h2>Developer Team</h2>
          <span className="count-badge">{developerTeam.length}</span>
        </div>
        
        {loading.developers ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading developers...</p>
          </div>
        ) : (
          <div className="content-grid developer-grid">
            {developerTeam.length > 0 ? (
              developerTeam.map((member) => (
                <div key={member._id} className="content-card developer-card">
                  <div className="developer-avatar">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  </div>
                  
                  <div className="developer-info">
                    <h3>{member.name}</h3>
                    <p className="developer-roll">Roll: {member.roll}</p>
                    <p className="developer-dept">Dept: {member.dept}</p>
                  </div>
                  
                  <div className="developer-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openEditPage('developer_team', member._id)}
                      title="Edit Developer"
                    >
                      <FaEdit />
                    </button>
                  </div>
                  
                  <div className="developer-social">
                    {member.github && (
                      <a href={member.github} target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaGithub />
                      </a>
                    )}
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaLinkedin />
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="social-link">
                        <FaEnvelope />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaUsers />
                <h3>No developers found</h3>
                <p>Add team members to showcase your development team</p>
                <button onClick={handleCreateDeveloper} className="empty-action-btn">
                  <FaPlus />
                  Add Developer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default About;