import React, { createContext, useState, useEffect } from 'react';

// Create Context
export const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [blogData, setBlogData] = useState([]);

  useEffect(() => {
    setBlogData(Blog_data); 
  }, []);

  return (
    <BlogContext.Provider value={{ blogData }}>
      {children}
    </BlogContext.Provider>
  );
};
