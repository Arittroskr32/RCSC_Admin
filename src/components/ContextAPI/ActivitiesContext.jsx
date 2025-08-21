import React, { createContext, useState, useContext } from 'react';
import activitiesData from '../../../public/Json/Activities.json'; 

const ActivitiesContext = createContext();

// Activities provider component
export const ActivitiesProvider = ({ children }) => {
  const [activities, setActivities] = useState(activitiesData);

  // Create activity
  const createActivity = (activity) => {
    setActivities((prevActivities) => [...prevActivities, activity]);
  };

  // Delete activity by ID
  const deleteActivity = (id) => {
    setActivities((prevActivities) => prevActivities.filter(activity => activity.id !== id));
  };

  // Update activity by ID
  const updateActivity = (id, updatedActivity) => {
    setActivities((prevActivities) => 
      prevActivities.map((activity) => 
        activity.id === id ? { ...activity, ...updatedActivity } : activity
      )
    );
  };

  // Show all activities
  const showActivities = () => {
    return activities;
  };

  return (
    <ActivitiesContext.Provider
      value={{ createActivity, deleteActivity, updateActivity, showActivities }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
};

// Custom hook to use the context
export const useActivities = () => {
  return useContext(ActivitiesContext);
};
