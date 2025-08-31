import React, { useState } from 'react';

/**
 * Save Status Indicator Component
 * Shows the current save status to the user
 */
const SaveStatusIndicator = ({ 
  isSaving, 
  hasUnsavedChanges, 
  lastSavedTime,
  className = ""
}) => {
  const getStatusInfo = () => {
    if (isSaving) {
      return {
        text: "Saving...",
        icon: "🔄",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      };
    }
    
    if (hasUnsavedChanges) {
      return {
        text: "Unsaved changes",
        icon: "⚠️",
        color: "text-orange-600",
        bgColor: "bg-orange-50"
      };
    }
    
    return {
      text: lastSavedTime ? `Saved ${formatTime(lastSavedTime)}` : "All changes saved",
      icon: "✅",
      color: "text-green-600",
      bgColor: "bg-green-50"
    };
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const saved = new Date(timestamp);
    const diffInSeconds = Math.floor((now - saved) / 1000);
    
    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else {
      return saved.toLocaleTimeString();
    }
  };

  const status = getStatusInfo();

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.color} ${status.bgColor} ${className}`}>
      <span className={isSaving ? "animate-spin" : ""}>{status.icon}</span>
      <span>{status.text}</span>
    </div>
  );
};

export default SaveStatusIndicator;
