import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Contact.css";

const Contact = () => {
    const { isAuthorized, BACKEND_URL } = useContext(Context);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    if (!isAuthorized) {
        navigate("/login");
    }

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

    useEffect(() => {

        const fetchMessages = async () => {
            try {
                setLoading(true);
                const { data } = await authAxios.get("/api/contact/get_messages");
                setMessages(data.messages || []);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to fetch messages");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    if (loading) {
        return <div className="contact-container">Loading messages...</div>;
    }

    // Filter messages by search
    const filterMessage = (msg) => {
        const q = search.toLowerCase();
        return (
            (msg.username || "").toLowerCase().includes(q) ||
            (msg.email || "").toLowerCase().includes(q) ||
            (msg.phone || "").toString().toLowerCase().includes(q)
        );
    };

    return (
        <div className="contact-container">
            <ToastContainer />
            <div className="contact-header-row">
                <h2>All Messages</h2>
                <div className="contact-search-bar">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>
            {messages.filter(filterMessage).length > 0 ? (
                <div className="contact-card-grid">
                    {messages.filter(filterMessage).map((msg) => (
                        <div 
                            key={msg._id} 
                            className="contact-card-item" 
                            onClick={() => navigate(`/contact/${msg._id}`)}
                        >
                            <div className="contact-card-header">
                                <span className="contact-avatar">{msg.username?.charAt(0) || '?'}</span>
                                <div>
                                    <p className="contact-card-name">{msg.username}</p>
                                    <p className="contact-card-email">{msg.email}</p>
                                </div>
                            </div>
                            <p className="contact-card-phone"><strong>Phone:</strong> {msg.phone}</p>
                            <p className="contact-card-message">{msg.message.substring(0, 80)}...</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No messages found</p>
            )}
        </div>
    );
};

export default Contact;