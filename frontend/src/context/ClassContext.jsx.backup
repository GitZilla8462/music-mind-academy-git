// src/context/ClassContext.jsx
import React, { createContext, useContext, useCallback } from 'react';

// Create the context
const ClassContext = createContext();

// Custom hook to use the class context
export const useClassContext = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClassContext must be used within a ClassProvider');
  }
  return context;
};

// Provider component
export const ClassProvider = ({ children }) => {
  // Update a class - Essential function needed by EditClassPage
  const updateClass = useCallback(async (classData) => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch('https://api.vocalgrid.com/api/update_class.php', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update class');
    }
    
    return result;
  }, []);

  // Load classes - Essential function needed by EditClassPage
  const loadClasses = useCallback(async (forceRefresh = false) => {
    // Simple implementation - just to satisfy the dependency in EditClassPage
    // You can expand this later if needed
    console.log("Loading classes, forceRefresh:", forceRefresh);
    // This function is primarily used by EditClassPage to refresh the 
    // class list after updates, but the actual implementation can be minimal
  }, []);

  // Provide only the essential functions that EditClassPage requires
  const value = {
    updateClass,
    loadClasses
  };

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>;
};

export default ClassContext;