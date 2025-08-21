import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Post_blog.css";
import { Context } from "../../main";

const Post_blog = () => {
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { BACKEND_URL, isAuthorized } = useContext(Context);

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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthorized) {
      toast.error("You must be logged in to post a blog");
      navigate('/login');
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    setLoading(true);

    try {
      const tagsArray = tagsInput.split(",").map((tag) => tag.trim()).filter((tag) => tag !== "");
      const formattedDate = formatDate(date);

      const newPost = {
        title,
        description,
        author,
        image: imageUrl,
        tags: tagsArray,
        category,
        date: formattedDate 
      };

      const response = await authAxios.post('/api/blogs/post_blog', newPost);
      toast.success("Blog post created successfully!");
      resetForm();
      setTimeout(() => navigate('/blog'), 1500);
    } catch (error) {
      console.error("Error creating blog post:", error);
      toast.error(error.response?.data?.message || "Failed to create blog post");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAuthor("");
    setTitle("");
    setDescription("");
    setTagsInput("");
    setTags([]);
    setImageUrl("");
    setDate("");
    setCategory("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      setTags([...tags, tagsInput.trim()]);
      setTagsInput("");
    }
  };

  return (
    <div className="post-blog">
      <ToastContainer />
      <h2>Post Blog</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Author Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Post Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="tags-input">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tags (comma separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Category (e.g. Technology, News)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        {imageUrl && <img src={imageUrl} alt="Preview" className="image-preview" />}
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Posting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default Post_blog;