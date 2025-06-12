import React, { useState, useEffect } from "react";
import { InferenceClient } from "@huggingface/inference";
import "../chatcomponent/ChatComponent.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const client = new InferenceClient("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");

export default function DeepSeekChat() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const navigate = useNavigate();
  // Load saved conversations from localStorage
  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
    return;
  }

  fetch('http://localhost:5000/api/mystories', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setConversations(data.map(story => ({
          id: story._id,
          title: story.prompt.substring(0, 30) + (story.prompt.length > 30 ? "..." : ""),
          prompt: story.prompt,
          story: story.story,
          date: new Date(story.createdAt).toLocaleString()
        })));
      } else {
        console.error('Unexpected response:', data);
      }
    })
    .catch(err => {
      console.error('Error fetching stories:', err);
    });
}, []);


  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResponse("");
    setGeneratedVideo(null);

    try {
      const chatCompletion = await client.chatCompletion({
        provider: "novita",
        model: "deepseek-ai/DeepSeek-R1",
        messages: [
          {
            role: "system",
            content: "You are a story-writing assistant. Only generate stories. If the user asks anything else, say: 'Sorry, I can only help with story generation.'",
          },
          {
            role: "user",
            content: input,
          },
        ],
      });

      let rawStory = chatCompletion.choices[0].message.content;
      let cleanedStory = rawStory
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/\*{2}([^*]+)\*{2}/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/---[\s\S]*/g, "")
        .trim();

      setResponse(cleanedStory);
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: input,
          story: cleanedStory
        })
      });

      // Save the new conversation
      const newConversation = {
        id: Date.now(),
        title: input.substring(0, 30) + (input.length > 30 ? "..." : ""),
        prompt: input,
        story: cleanedStory,
        date: new Date().toLocaleString()
      };
      
      const updatedConversations = [newConversation, ...conversations];
      setConversations(updatedConversations);
      localStorage.setItem('storyConversations', JSON.stringify(updatedConversations));
      setActiveConversation(newConversation.id);
    } catch (error) {
      console.error("Chat error:", error);
      setResponse("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateVideoFromStory = async () => {
    if (!response) return;
    
    setVideoLoading(true);
    setGeneratedVideo(null);
    
    try {
      // Extract the first sentence or a short description from the story
      const videoPrompt = response.split('.')[0] || "A scene from the story";
      
      const videoResponse = await client.textToVideo({
        provider: "replicate",
        model: "Lightricks/LTX-Video",
        inputs: {
          prompt: videoPrompt,
          // You can add more parameters here as needed
        },
      });
      
      setGeneratedVideo(videoResponse);
    } catch (error) {
      console.error("Video generation error:", error);
      alert("Failed to generate video. Please try again.");
    } finally {
      setVideoLoading(false);
    }
  };

  const startNewConversation = () => {
    setInput("");
    setResponse("");
    setGeneratedVideo(null);
    setActiveConversation(null);
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(false);
    }
  };

  const loadConversation = (id) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setInput(conversation.prompt);
      setResponse(conversation.story);
      setActiveConversation(id);
      setGeneratedVideo(null);
    }
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(false);
    }
  };

  const deleteConversation = (id, e) => {
    e.stopPropagation();
    const updatedConversations = conversations.filter(c => c.id !== id);
    setConversations(updatedConversations);
    localStorage.setItem('storyConversations', JSON.stringify(updatedConversations));
    
    if (activeConversation === id) {
      startNewConversation();
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove JWT token
    navigate('/login');               // Redirect to login page
  };
  return (
    <div className="app-container">
      {/* Sidebar/Navbar */}
      <div className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={startNewConversation}>
            <svg viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            New Story
          </button>
          <button className="mobile-close-btn" onClick={() => setMobileSidebarOpen(false)}>
            <svg viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div className="conversation-list">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              className={`conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
              onClick={() => loadConversation(conv.id)}
            >
              <div className="conversation-title">{conv.title}</div>
              <div className="conversation-date">{conv.date}</div>
              <button 
                className="delete-conversation"
                onClick={(e) => deleteConversation(conv.id, e)}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <Link to="/login" className="login-link">
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            Logout
          </button>
          </Link>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="chat-container">
        {/* Mobile sidebar toggle */}
        <button 
          className="mobile-sidebar-toggle"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        
        {/* Chat Header */}
        <div className="chat-header">
          <h1 className="chat-title">BOT TALES</h1>
        </div>
        
        {/* Story Display Area */}
        <div className="story-display">
          {response ? (
            <div className="story-content">
              <p>{response}</p>
              {!generatedVideo && (
                <button 
                  className={`generate-video-btn ${videoLoading ? 'loading' : ''}`}
                  onClick={generateVideoFromStory}
                  disabled={videoLoading}
                >
                  {videoLoading ? (
                    <span className="spinner"></span>
                  ) : (
                    "Generate Video from Story"
                  )}
                </button>
              )}
              {generatedVideo && (
                <div className="video-container">
                  <video controls width="100%">
                    <source src={generatedVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="magic-wand-icon">
                <span className="material-symbols-outlined robo-icon">
                  smart_toy
                </span>
              </div>
              <h3>Create Your First Story</h3>
              <p>Enter a prompt below to generate a magical story</p>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="input-section">
          <textarea
            className="story-input"
            placeholder="Once upon a time..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button 
            className={`generate-btn ${loading ? 'loading' : ''}`} 
            onClick={handleSubmit} 
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>Generate</span>
                <span className="material-symbols-outlined">
                  send
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}