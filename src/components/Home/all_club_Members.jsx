import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Context } from '../../main';
import { Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaPaperPlane, FaTimes, FaUsers } from 'react-icons/fa';
import './all_club_Members.css';

const all_club_Members = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [memberDetails, setMemberDetails] = useState(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    series: '',
    phone: '',
    dept: '',
  });
  const [showMailModal, setShowMailModal] = useState(false);
  const [mailData, setMailData] = useState({
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  if (!isAuthorized) return <Navigate to="/login" />;

  // Fetch all members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await authAxios.get('/api/club-member');
      setMembers(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Add member
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAxios.post('/api/club-member', newMember);
      toast.success(data.message);
      setNewMember({ name: '', email: '', series: '', phone: '', dept: '' });
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete member
  const handleDelete = async (email) => {
    try {
      const { data } = await authAxios.delete('/api/club-member', { data: { email } });
      toast.success(data.message);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Search member by email
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authAxios.post('/api/club-member/get-member', { email: searchEmail });
      setMemberDetails(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed');
      setMemberDetails(null);
    }
  };

  // Send mail to all members
  const handleSendMail = async (e) => {
    e.preventDefault();
    if (!mailData.subject.trim() || !mailData.message.trim()) {
      toast.error('Subject and message are required');
      return;
    }

    setSending(true);
    try {
      const fullMessage = `Hi,\n\n${mailData.message}\n\nBest regards,\nRUET Cyber Security Club`;
      
      const html = getEmailPreview(mailData.subject, fullMessage);

      const { data } = await authAxios.post('/api/club-member/send-mail-to-all', {
        subject: mailData.subject,
        text: fullMessage,
        html
      });

      toast.success(data.message || 'Emails sent successfully!');
      setMailData({ subject: '', message: '' });
      setShowMailModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  // Generate full HTML email preview matching newsletter format
  const getEmailPreview = (subject = mailData.subject || '', message = mailData.message || '') => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
        .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 40px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 12px; }
        .tagline { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px; }
        .message { font-size: 16px; line-height: 1.8; margin-bottom: 30px; white-space: pre-line; }
        .cta { text-align: center; margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
        .footer { background: #f1f5f9; padding: 30px 40px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .social-links { margin: 20px 0; }
        .social-links a { display: inline-block; margin: 0 15px; color: #64748b; text-decoration: none; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛡️ RUET Cyber Security Club</div>
          <div class="tagline">Empowering Cybersecurity at RUET</div>
        </div>
        <div class="content">
          <div class="message">${message}</div>
          <div class="cta">
            <a href="https://rcsc.ruet.ac.bd" class="cta-button">Visit Our Club</a>
          </div>
        </div>
        <div class="footer">
          <div class="social-links">
            <a href="https://github.com/ruet-cyber-security-club">GitHub</a>
            <a href="https://x.com/ruetcyber">Twitter</a>
            <a href="https://linkedin.com/company/ruet-cyber-security-club">LinkedIn</a>
          </div>
          <div>
            <strong>RUET Cyber Security Club Team</strong><br>
            Dedicated to cybersecurity research, innovation, and education.<br>
            Join us for workshops, CTFs, and more!
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  };

  return (
    <div className="club-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="header-section">
        <h2><FaUsers className="header-icon" /> Manage Club Members</h2>
        <button 
          className="mail-all-btn"
          onClick={() => setShowMailModal(true)}
          disabled={members.length === 0}
        >
          <FaEnvelope className="btn-icon" />
          Send Mail to All ({members.length})
        </button>
      </div>

      {/* Mail Modal */}
      {showMailModal && (
        <div className="modal-overlay">
          <div className="mail-modal">
            <div className="modal-header">
              <h3><FaEnvelope className="modal-icon" /> Send Email to All Members</h3>
              <button 
                className="close-btn"
                onClick={() => setShowMailModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSendMail} className="mail-form">
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={mailData.subject}
                  onChange={(e) => setMailData({ ...mailData, subject: e.target.value })}
                  placeholder="Enter email subject"
                  required
                  disabled={sending}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  value={mailData.message}
                  onChange={(e) => setMailData({ ...mailData, message: e.target.value })}
                  placeholder="Write your message here..."
                  rows={8}
                  required
                  disabled={sending}
                />
                <small className="form-note">
                  Note: Email will be automatically signed with "Best regards, RUET Cyber Security Club"
                </small>
              </div>

              {/* Email Preview */}
              <div className="form-group">
                <label>Preview</label>
                <div className="email-preview-box" style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                  {/* Use an iframe with srcDoc so full HTML (head/style) renders correctly */}
                  <iframe
                    title="email-preview"
                    className="email-preview-iframe"
                    srcDoc={getEmailPreview(mailData.subject, mailData.message ? `Hi,\n\n${mailData.message}\n\nBest regards,\nRUET Cyber Security Club` : '')}
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowMailModal(false)}
                  disabled={sending}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="send-btn"
                  disabled={sending}
                >
                  {sending ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <FaPaperPlane className="btn-icon" />
                      Send to {members.length} Members
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member */}
      <section className="add-member-section">
        <h3>Add Club Member</h3>
        <form onSubmit={handleAdd} className="add-member-form">
          {['name', 'email', 'series', 'phone', 'dept'].map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              value={newMember[field]}
              onChange={(e) => setNewMember({ ...newMember, [field]: e.target.value })}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              required
              disabled={loading}
            />
          ))}
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      </section>

      {/* View Member */}
      <section className="view-member-section">
        <h3>View Member by Email</h3>
        <form onSubmit={handleSearch} className="view-member-form">
          <input
            type="email"
            placeholder="Enter Email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>Search</button>
        </form>

          {memberDetails === null && searchEmail && (
            <div className="no-member-found">
              <p>No member found with this email.</p>
            </div>
          )}
          {memberDetails && (
            <div className="member-details">
              <p><strong>Name:</strong> {memberDetails.name}</p>
              <p><strong>Email:</strong> {memberDetails.email}</p>
              <p><strong>Series:</strong> {memberDetails.series}</p>
              <p><strong>Phone:</strong> {memberDetails.phone}</p>
              <p><strong>Dept:</strong> {memberDetails.dept}</p>
            </div>
          )}
      </section>

      {/* All Members Table */}
      <section className="all-members-section">
        <h3>All Members</h3>
        {loading ? (
          <p>Loading members...</p>
        ) : (
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Series</th>
                <th>Phone</th>
                <th>Dept</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.email}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.series}</td>
                  <td>{member.phone}</td>
                  <td>{member.dept}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(member.email)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      
      <ToastContainer />
    </div>
  );
};

export default all_club_Members;
