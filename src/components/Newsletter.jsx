import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Context } from '../main';
import { ToastContainer, toast } from 'react-toastify';
import { Navigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './Newsletter.css';

const Newsletter = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  useEffect(() => {
    if (isAuthorized) fetchSubscribers();
  }, []);

  if (!isAuthorized) return <Navigate to="/login" />;

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data } = await authAxios.get('/api/newsletter/subscribers');
      setSubscribers(data.subscribers || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return toast.error('Email is required');
    try {
      await authAxios.post('/api/newsletter/subscribe', { email: newEmail });
      toast.success('Subscriber added');
      setNewEmail('');
      fetchSubscribers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
  };

  const handleDeleteSubscriber = async (email) => {
    if (!window.confirm(`Delete subscriber ${email}?`)) return;
    try {
      await authAxios.post('/api/newsletter/delete', { email });
      toast.success('Subscriber removed');
      fetchSubscribers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const getEmailPreview = () => {
    return `
    <div class="rcsc-email-preview">
      <style>
        .rcsc-email-preview { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; background-color: transparent; padding: 20px; }
        .rcsc-email-preview .rcsc-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
  .rcsc-email-preview .rcsc-header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 24px 28px; display: flex; align-items: center; gap: 18px; }
  .rcsc-email-preview .rcsc-logo-img { display: block; width: 88px; height: auto; object-fit: contain; }
  .rcsc-email-preview .rcsc-logo-text { display: flex; flex-direction: column; }
  .rcsc-email-preview .rcsc-club-name { font-size: 20px; font-weight: 700; line-height: 1; }
  .rcsc-email-preview .rcsc-tagline { font-size: 14px; opacity: 0.95; margin-top: 4px; }
        .rcsc-email-preview .rcsc-content { padding: 40px; }
        .rcsc-email-preview .rcsc-message { font-size: 16px; line-height: 1.8; margin-bottom: 30px; white-space: pre-line; }
        .rcsc-email-preview .rcsc-cta { text-align: center; margin: 40px 0; }
        .rcsc-email-preview .rcsc-cta-button { display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; }
        .rcsc-email-preview .rcsc-footer { background: #f1f5f9; padding: 30px 40px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .rcsc-email-preview .rcsc-social-links { margin: 20px 0; }
        .rcsc-email-preview .rcsc-social-links a { display: inline-block; margin: 0 15px; color: #64748b; text-decoration: none; }
      </style>
      <div class="rcsc-container">
        <div class="rcsc-header">
          <img src="/Assets/RCSC_logo2.png" alt="RCSC logo" class="rcsc-logo-img" />
          <div class="rcsc-logo-text">
            <div class="rcsc-club-name">RUET Cyber Security Club</div>
            <div class="rcsc-tagline">Empowering Cybersecurity at RUET</div>
          </div>
        </div>
        <div class="rcsc-content">
          <div class="rcsc-message">${message}</div>
          <div class="rcsc-cta">
            <a href="https://rcsc.ruet.ac.bd" class="rcsc-cta-button">Visit Our Club</a>
          </div>
        </div>
        <div class="rcsc-footer">
          <div class="rcsc-social-links">
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
    </div>
    `;
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    setLoading(true);
    try {
      await authAxios.post('/api/newsletter/send', { subject, message });
      toast.success('Newsletter sent successfully!');
      setSubject('');
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newsletter-wrapper">
      <div className="newsletter-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="add-subscriber">
        <h3>Add Subscriber</h3>
        <form onSubmit={handleAddSubscriber}>
          <input type="email" placeholder="Subscriber email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
          <button type="submit">Add</button>
        </form>
      </div>

      <div className="newsletter-header">
        <h2>Newsletter</h2>
        <p className="subtitle">Send styled emails and manage subscribers</p>
      </div>

      <div className="compose-send">
        <form className="newsletter-form" onSubmit={handleSendNewsletter}>
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          required
          disabled={loading}
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={8}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Newsletter'}
        </button>
      </form>
  {/* add-subscriber moved above */}
      </div>

  {/* subscribers-list moved below preview; a search box filters the list client-side */}
      <div className="email-preview">
        <h3>Email Preview</h3>
        <div dangerouslySetInnerHTML={{ __html: getEmailPreview() }} />
      </div>
      <div className="subscribers-list">
        <h3>Subscribers</h3>
        <div className="subscriber-controls">
          <input
            type="search"
            placeholder="Search email"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="button" onClick={() => setSearchQuery('')}>Clear</button>
        </div>
        {loading ? <p>Loading...</p> : (
          subscribers.length > 0 ? (
            (() => {
              const q = searchQuery.trim().toLowerCase();
              const filtered = q ? subscribers.filter(s => s.toLowerCase().includes(q)) : subscribers;
              return filtered.length > 0 ? (
                <ul>
                  {filtered.map((email, idx) => (
                    <li key={idx}>
                      <span>{email}</span>
                      <button className="delete" onClick={() => handleDeleteSubscriber(email)}>Delete</button>
                    </li>
                  ))}
                </ul>
              ) : <p>No matching subscribers.</p>;
            })()
          ) : <p>No subscribers yet.</p>
        )}
      </div>
      </div>
    </div>
  );
};

export default Newsletter;
