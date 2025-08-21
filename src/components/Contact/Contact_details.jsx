import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Context } from "../../main";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Contact_details.css";

const Contact_details = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const { contactId } = useParams();
  const navigate = useNavigate();

  const [messageData, setMessageData] = useState(null);
  const [reply, setReply] = useState("");
  const [subject, setSubject] = useState("Response from RUET Cyber Security Club!");
  const [loading, setLoading] = useState({
    fetch: true,
    delete: false,
    reply: false,
  });
  const [error, setError] = useState(null);

  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  authAxios.interceptors.request.use((config) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Fetch message details
  useEffect(() => {
    if (!isAuthorized) return;
    const fetchMessageDetails = async () => {
      try {
        setLoading((prev) => ({ ...prev, fetch: true }));
        setError(null);
        const response = await authAxios.get(
          `/api/contact/get_messages/${contactId}`
        );
        if (!response.data || !response.data.data) {
          throw new Error("Message data not found in response");
        }
        setMessageData(response.data.data);
      } catch (error) {
        setError(error.message || "Failed to fetch message");
        toast.error(error.message || "Failed to fetch message");
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    };
    fetchMessageDetails();
  }, [contactId, isAuthorized]);

  // Reply to message
  const handleReply = async () => {
    if (!reply.trim()) {
      toast.error("Reply message cannot be empty");
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, reply: true }));
      const messageBody = `Hi,\n\n${reply}\n\nBest regards,\nRCSC Admin Team\nRUET Cyber Security Club`;
      // send both text and html (html uses the newsletter-style template)
      const payload = {
        to: messageData.email,
        username: messageData.username,
        subject: subject || "Response from RUET Cyber Security Club!",
        text: messageBody,
        html: getEmailPreview(subject || "Response from RUET Cyber Security Club!", messageBody),
      };
      await authAxios.post(`/api/contact/reply`, payload);
      toast.dismiss();
      toast.success("Reply sent successfully!");
      setReply("");
      setSubject("Response from RUET Cyber Security Club!");
    } catch (error) {
      console.error("Reply error:", error);
      toast.error(error.response?.data?.message || "Failed to send reply");
    } finally {
      setLoading((prev) => ({ ...prev, reply: false }));
    }
  };

  const getEmailPreview = (subject, message) => {
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
        .logo { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .tagline { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px; }
        .message { font-size: 16px; line-height: 1.8; margin-bottom: 20px; white-space: pre-line; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: 600; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">RUET Cyber Security Club</div>
          <div class="tagline">Empowering Cybersecurity at RUET</div>
        </div>
        <div class="content">
          <div class="message">${message}</div>
          <div style="text-align:center; margin-top: 18px;"><a href="https://rcsc.ruet.ac.bd" class="cta-button">Visit Our Club</a></div>
        </div>
        <div class="footer">
          <div>
            <strong>RUET Cyber Security Club Team</strong><br>
            Dedicated to cybersecurity research, innovation, and education.
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  // Delete message
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      setLoading((prev) => ({ ...prev, delete: true }));
      await authAxios.delete(`/api/contact/delete_message/${contactId}`);
      toast.success("Message deleted successfully", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => {
        navigate("/contact");
      }, 1000);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete message");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  if (loading.fetch) {
    return <div className="contact-details">Loading message details...</div>;
  }

  if (error) {
    return (
      <div className="contact-details">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/contact")}>Back to Messages</button>
      </div>
    );
  }

  return (
    <div className="contact-details-card">
      {/* ToastContainer should be rendered once in App.jsx at the root level */}
      {messageData ? (
        <>
          <div className="contact-details-header">
            <span className="contact-details-avatar">{messageData.username?.charAt(0) || '?'}</span>
            <div>
              <h2>{messageData.username}</h2>
              <p className="contact-details-email">{messageData.email}</p>
              <p className="contact-details-phone">{messageData.phone}</p>
            </div>
          </div>
          <div className="contact-details-message-block">
            <label>Message:</label>
            <div className="contact-details-message">{messageData.message}</div>
          </div>
          <div className="contact-details-reply-block">
            <h3>Send a Reply</h3>
            <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); handleReply(); }}>
              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                disabled={loading.reply}
              />
              <textarea
                placeholder="Write your reply here..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={8}
                required
                disabled={loading.reply}
                className="reply-textarea"
              />
              <div className="button-group">
                <button type="submit" className="reply-btn" disabled={loading.reply}>
                  {loading.reply ? 'Sending...' : 'Send Reply'}
                </button>
                <button
                  className="delete-btn"
                  onClick={handleDelete}
                  type="button"
                  disabled={loading.delete}
                >
                  {loading.delete ? "Deleting..." : "Delete Message"}
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <p>No message data available</p>
      )}
    </div>
  );
}

export default Contact_details;
