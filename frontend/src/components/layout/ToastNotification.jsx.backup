// src/components/layout/ToastNotification.jsx
import React from 'react';

const ToastNotification = ({ toast, setToast }) => {
  if (!toast) return null;
  
  const { message, type } = toast;
  let bgColor = 'bg-blue-500';
  
  if (type === 'success') bgColor = 'bg-green-500';
  else if (type === 'error') bgColor = 'bg-red-500';
  else if (type === 'warning') bgColor = 'bg-yellow-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white p-3 rounded-md shadow-lg flex items-center z-50`}>
      <span>{message}</span>
      <button 
        onClick={() => setToast(null)}
        className="ml-3 text-white"
      >
        ×
      </button>
    </div>
  );
};

export default ToastNotification;