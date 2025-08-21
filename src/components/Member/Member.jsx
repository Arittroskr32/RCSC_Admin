import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { Context } from "../../main";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Member.css";

const Member = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Search state (must be before any conditional returns)
  const [search, setSearch] = useState("");

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

    const fetchMembers = async () => {
      try {
        setLoading(true);
        const { data } = await authAxios.get("/api/members/getmember");
        setMembers(data.data || []);
      } catch (error) {
        console.error("Error fetching members:", error);
        setError(error.response?.data?.message || "Failed to fetch members");
        toast.error(error.response?.data?.message || "Failed to fetch members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isAuthorized, navigate]);

  const handleEditClick = (id) => {
    console.log("Navigating to:", `/member/${id}`); // Debug log
    navigate(`/member/${id}`);
  };

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return <div className="member-container">Loading members...</div>;
  }

  if (error) {
    return <div className="member-container">Error: {error}</div>;
  }



  // Filter function for search

  const filterMember = (member) => {
    const q = search.toLowerCase();
    const name = (member.name || "").toString().toLowerCase();
    const roll = (member.roll || "").toString().toLowerCase();
    const dept = (member.department || "").toString().toLowerCase();
    return (
      name.includes(q) ||
      roll.includes(q) ||
      dept.includes(q)
    );
  };

  const currentCommitteeMembers = members.filter(
    (member) => member.committee === "new" && filterMember(member)
  );
  const previousCommitteeMembers = members.filter(
    (member) => member.committee === "old" && filterMember(member)
  );

  return (
    <div className="member-container">
      <ToastContainer />

      <div className="member-header">
        <h2>All Members</h2>
        <button
          className="add-member-btn"
          onClick={() => navigate("/addmember")}
        >
          Add Member
        </button>
      </div>
      <div className="member-search-bar">
        <input
          type="text"
          placeholder="Search by name, roll, or department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {currentCommitteeMembers.length > 0 && (
        <>
          <h2>Current Committee</h2>
          <ul className="member-list">
            {currentCommitteeMembers.map((member) => (
              <li key={member._id} className="member-item">
                <div className="member-info">
                  <div className="member-details">
                    <p><strong>Name:</strong> {member.name}</p>
                    <p><strong>Post:</strong> {member.post}</p>
                    <p><strong>Department:</strong> {member.department}</p>
                    <p><strong>Roll:</strong> {member.roll}</p>
                    <p><strong>Contact:</strong> {member.contact}</p>
                    <p><strong>Committee:</strong> {member.committee}</p>
                    <p><strong>Series:</strong> {member.series}</p>
                  </div>
                </div>
                <div 
                  className="edit-icon"
                  onClick={() => handleEditClick(member._id)}
                  style={{ cursor: "pointer" }}
                >
                  <FaEdit />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {previousCommitteeMembers.length > 0 && (
        <>
          <h2>Previous Committee</h2>
          <ul className="member-list">
            {previousCommitteeMembers.map((member) => (
              <li key={member._id} className="member-item">
                <div className="member-info">
                  <div className="member-details">
                    <p><strong>Name:</strong> {member.name}</p>
                    <p><strong>Post:</strong> {member.post}</p>
                    <p><strong>Department:</strong> {member.department}</p>
                    <p><strong>Roll:</strong> {member.roll}</p>
                    <p><strong>Contact:</strong> {member.contact}</p>
                    <p><strong>Committee:</strong> {member.committee}</p>
                    <p><strong>Series:</strong> {member.series}</p>
                  </div>
                </div>
                <div 
                  className="edit-icon"
                  onClick={() => handleEditClick(member._id)}
                  style={{ cursor: "pointer" }}
                >
                  <FaEdit />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Member;