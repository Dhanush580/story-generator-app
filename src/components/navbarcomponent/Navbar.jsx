import React, { useState, useEffect } from 'react';
import { FiMenu, FiX, FiBook, FiClock, FiTrash2 } from 'react-icons/fi';
import '../navbarcomponent/Navbar.css'; // Create this CSS file

const  Navbar= ({ stories, onSelectStory, onDeleteStory }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setIsOpen(false);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <div className={`story-sidebar ${isOpen ? 'open' : 'closed'} ${isMobile ? 'mobile' : ''}`}>
        <div className="sidebar-header">
          <h3>
            <FiBook className="icon" /> Story Archive
          </h3>
          {!isMobile && (
            <button onClick={toggleSidebar} className="close-btn">
              <FiX size={18} />
            </button>
          )}
        </div>

        <div className="sidebar-content">
          {stories.length === 0 ? (
            <div className="empty-state">
              <p>No stories generated yet</p>
            </div>
          ) : (
            <ul className="story-list">
              {stories.map((story) => (
                <li key={story.id} className="story-item">
                  <button 
                    onClick={() => onSelectStory(story.id)}
                    className="story-btn"
                  >
                    <div className="story-title">{story.title || 'Untitled Story'}</div>
                    <div className="story-meta">
                      <FiClock className="icon" />
                      <span>{formatDate(story.createdAt)}</span>
                    </div>
                    <div className="story-preview">
                      {story.content.substring(0, 60)}...
                    </div>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteStory(story.id);
                    }}
                    className="delete-btn"
                    aria-label="Delete story"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;