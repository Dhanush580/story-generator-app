import React, { useState } from "react";
import { InferenceClient } from "@huggingface/inference";
import "../chatcomponent/ChatComponent.css";

const client = new InferenceClient("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");

export default function DeepSeekChat() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  if (!input.trim()) return;

  setLoading(true);
  setResponse("");

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

    // Raw response
    let rawStory = chatCompletion.choices[0].message.content;

    // Clean the response
    let cleanedStory = rawStory
      .replace(/<think>[\s\S]*?<\/think>/gi, '') // remove <think> tags
      .replace(/\*{2}([^*]+)\*{2}/g, "$1") // remove **bold**
      .replace(/\*([^*]+)\*/g, "$1") // remove *italic*
      .replace(/---[\s\S]*/g, "") // remove trailing suggestions or footers like "--- Hope you enjoyed..."
      .trim();

    setResponse(cleanedStory);
  } catch (error) {
    console.error("Chat error:", error);
    setResponse("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="deepseek-wrapper">
      <div className="deepseek-container">
        <div className="chat-header">
          <h1 className="chat-title">Story Weaver</h1>
          <p className="chat-subtitle">Powered by DeepSeek AI</p>
        </div>
        
        <div className="input-section">
          <textarea
            className="story-input"
            placeholder="Once upon a time..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
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
                <span>Weave Magic</span>
                <svg className="magic-icon" viewBox="0 0 24 24">
                  <path d="M20 7h-4V5l-2-2h-4L8 5v2H4c-1.1 0-2 .9-2 2v5c0 .75.4 1.38 1 1.73V19c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2v-3.28c.59-.35 1-.99 1-1.72V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zM4 9h16v5h-5v-3H9v3H4V9zm9 6h-2v-2h2v2zm6 4H5v-3h4v1h6v-1h4v3z"/>
                </svg>
              </>
            )}
          </button>
        </div>
        
        {response && (
          <div className="output-section">
            <div className="response-header">
              <h3>Your Enchanted Tale</h3>
              <button 
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(response)}
                title="Copy to clipboard"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </button>
            </div>
            <div className="response-content">
              <p>{response}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}