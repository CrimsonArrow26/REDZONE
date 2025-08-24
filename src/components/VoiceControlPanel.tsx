import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Square, Settings, Trash2, Plus } from 'lucide-react';
import { useZone } from '../context/ZoneContext';

interface VoiceSession {
  id: string;
  keywords: string[];
  isActive: boolean;
  transcript: string;
}

const VoiceControlPanel: React.FC = () => {
  const {
    isSafe,
    voiceSessions,
    activeSessionCount,
    currentVoiceLevel,
    createVoiceSession,
    startVoiceSession,
    stopVoiceSession,
    updateKeywords,
    getSessionTranscript
  } = useZone();

  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSessionId, setNewSessionId] = useState('');
  const [newSessionKeywords, setNewSessionKeywords] = useState('help,emergency,danger');
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});

  // Convert Map to array for easier rendering
  useEffect(() => {
    const sessionArray: VoiceSession[] = [];
    voiceSessions.forEach((session, id) => {
      sessionArray.push({
        id,
        keywords: session.keywords || [],
        isActive: session.isActive || false,
        transcript: session.transcript || ''
      });
    });
    setSessions(sessionArray);

    // Update transcripts
    const newTranscripts: Record<string, string> = {};
    sessionArray.forEach(session => {
      newTranscripts[session.id] = getSessionTranscript(session.id);
    });
    setTranscripts(newTranscripts);
  }, [voiceSessions, getSessionTranscript]);

  const handleCreateSession = async () => {
    if (!newSessionId.trim()) {
      alert('Please enter a session ID');
      return;
    }

    const keywords = newSessionKeywords.split(',').map(k => k.trim()).filter(k => k);
    if (keywords.length === 0) {
      alert('Please enter at least one keyword');
      return;
    }

    const success = await createVoiceSession(newSessionId, keywords);
    if (success) {
      console.log(`✅ Created voice session: ${newSessionId} with keywords:`, keywords);
      setNewSessionId('');
      setNewSessionKeywords('help,emergency,danger');
      setShowAddSession(false);
    } else {
      alert('Failed to create voice session');
    }
  };

  const handleToggleSession = (sessionId: string, isActive: boolean) => {
    if (isActive) {
      stopVoiceSession(sessionId);
    } else {
      startVoiceSession(sessionId);
    }
  };

  const handleUpdateKeywords = (sessionId: string, keywordsString: string) => {
    const keywords = keywordsString.split(',').map(k => k.trim()).filter(k => k);
    updateKeywords(sessionId, keywords);
  };

  const getVoiceLevelColor = () => {
    if (currentVoiceLevel > 0.8) return '#ff4444'; // Red - Very high
    if (currentVoiceLevel > 0.6) return '#ff9944'; // Orange - High
    if (currentVoiceLevel > 0.4) return '#ffdd44'; // Yellow - Medium
    if (currentVoiceLevel > 0.2) return '#44dd44'; // Green - Low
    return '#4444dd'; // Blue - Very low
  };

  if (isSafe) {
    return (
      <div className="voice-control-safe">
        <div className="voice-status-safe">
          <MicOff size={24} />
          <span>Voice monitoring inactive - Not in red zone</span>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-control-panel">
      <div className="voice-header">
        <h3>🎤 Multi-Voice Safety Monitor</h3>
        <div className="voice-stats">
          <span className="active-sessions">
            Active Sessions: <strong>{activeSessionCount}</strong>
          </span>
          <div className="voice-level-indicator">
            <Volume2 size={16} />
            <div className="voice-level-bar">
              <div 
                className="voice-level-fill" 
                style={{ 
                  width: `${currentVoiceLevel * 100}%`,
                  backgroundColor: getVoiceLevelColor()
                }}
              />
            </div>
            <span>{(currentVoiceLevel * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Voice Sessions */}
      <div className="voice-sessions">
        {sessions.map((session) => (
          <div key={session.id} className={`voice-session ${session.isActive ? 'active' : 'inactive'}`}>
            <div className="session-header">
              <div className="session-info">
                <h4>Session: {session.id}</h4>
                <div className="session-status">
                  {session.isActive ? (
                    <span className="status-active">🟢 Listening</span>
                  ) : (
                    <span className="status-inactive">🔴 Stopped</span>
                  )}
                </div>
              </div>
              <div className="session-controls">
                <button
                  onClick={() => handleToggleSession(session.id, session.isActive)}
                  className={`session-toggle ${session.isActive ? 'stop' : 'start'}`}
                  title={session.isActive ? 'Stop Session' : 'Start Session'}
                >
                  {session.isActive ? <Square size={16} /> : <Play size={16} />}
                </button>
              </div>
            </div>

            <div className="session-keywords">
              <label>Keywords:</label>
              <input
                type="text"
                value={session.keywords.join(', ')}
                onChange={(e) => handleUpdateKeywords(session.id, e.target.value)}
                placeholder="help, emergency, danger"
                className="keywords-input"
              />
            </div>

            {transcripts[session.id] && (
              <div className="session-transcript">
                <label>Live Transcript:</label>
                <div className="transcript-text">
                  {transcripts[session.id] || 'No speech detected yet...'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Session */}
      <div className="add-session-section">
        {!showAddSession ? (
          <button onClick={() => setShowAddSession(true)} className="add-session-btn">
            <Plus size={16} />
            Create New Voice Session
          </button>
        ) : (
          <div className="add-session-form">
            <h4>Create New Voice Session</h4>
            <div className="form-group">
              <label>Session ID:</label>
              <input
                type="text"
                value={newSessionId}
                onChange={(e) => setNewSessionId(e.target.value)}
                placeholder="e.g. emergency, backup, multilang"
                className="session-id-input"
              />
            </div>
            <div className="form-group">
              <label>Keywords (comma-separated):</label>
              <input
                type="text"
                value={newSessionKeywords}
                onChange={(e) => setNewSessionKeywords(e.target.value)}
                placeholder="help,emergency,danger,socorro,aide"
                className="keywords-input"
              />
            </div>
            <div className="form-actions">
              <button onClick={handleCreateSession} className="create-btn">
                Create Session
              </button>
              <button 
                onClick={() => setShowAddSession(false)} 
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="voice-instructions">
        <h4>📋 Multi-Voice Instructions</h4>
        <ul>
          <li><strong>Multiple Sessions:</strong> Create separate sessions for different languages, users, or contexts</li>
          <li><strong>Custom Keywords:</strong> Each session can listen for different emergency keywords</li>
          <li><strong>Simultaneous Listening:</strong> Multiple sessions can run at the same time</li>
          <li><strong>Real-time Transcripts:</strong> See what each session is hearing in real-time</li>
          <li><strong>Voice Level Monitor:</strong> Track overall voice/noise levels for additional safety alerts</li>
        </ul>
      </div>

      <style jsx>{`
        .voice-control-panel {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .voice-control-safe {
          background: rgba(200, 200, 200, 0.9);
          border-radius: 12px;
          padding: 15px;
          text-align: center;
          margin: 20px 0;
        }

        .voice-status-safe {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #666;
        }

        .voice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .voice-header h3 {
          margin: 0;
          color: #333;
        }

        .voice-stats {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .active-sessions {
          background: #e8f5e8;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 14px;
          color: #2e7d2e;
        }

        .voice-level-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .voice-level-bar {
          width: 80px;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }

        .voice-level-fill {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 4px;
        }

        .voice-sessions {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .voice-session {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          background: #fafafa;
        }

        .voice-session.active {
          border-color: #4CAF50;
          background: #f8fff8;
        }

        .voice-session.inactive {
          border-color: #ff9800;
          background: #fff8f0;
        }

        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .session-info h4 {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #333;
        }

        .status-active {
          color: #4CAF50;
          font-weight: 500;
          font-size: 14px;
        }

        .status-inactive {
          color: #ff9800;
          font-weight: 500;
          font-size: 14px;
        }

        .session-controls {
          display: flex;
          gap: 8px;
        }

        .session-toggle {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .session-toggle.start {
          background: #4CAF50;
          color: white;
        }

        .session-toggle.start:hover {
          background: #45a049;
        }

        .session-toggle.stop {
          background: #ff5722;
          color: white;
        }

        .session-toggle.stop:hover {
          background: #e64a19;
        }

        .session-keywords {
          margin-bottom: 10px;
        }

        .session-keywords label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
          font-size: 14px;
        }

        .keywords-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .keywords-input:focus {
          outline: none;
          border-color: #2196F3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
        }

        .session-transcript {
          background: #f0f0f0;
          border-radius: 6px;
          padding: 10px;
        }

        .session-transcript label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
          font-size: 14px;
        }

        .transcript-text {
          font-family: monospace;
          font-size: 13px;
          color: #333;
          min-height: 20px;
          line-height: 1.4;
          background: white;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .add-session-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .add-session-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .add-session-btn:hover {
          background: #1976D2;
        }

        .add-session-form {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .add-session-form h4 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
          font-size: 14px;
        }

        .session-id-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .session-id-input:focus {
          outline: none;
          border-color: #2196F3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
        }

        .form-actions {
          display: flex;
          gap: 10px;
        }

        .create-btn {
          padding: 8px 15px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .create-btn:hover {
          background: #45a049;
        }

        .cancel-btn {
          padding: 8px 15px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .cancel-btn:hover {
          background: #5a6268;
        }

        .voice-instructions {
          margin-top: 20px;
          padding: 15px;
          background: #e8f4fd;
          border-radius: 8px;
          border-left: 4px solid #2196F3;
        }

        .voice-instructions h4 {
          margin: 0 0 10px 0;
          color: #1976D2;
        }

        .voice-instructions ul {
          margin: 0;
          padding-left: 20px;
        }

        .voice-instructions li {
          margin-bottom: 8px;
          line-height: 1.4;
          color: #333;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .voice-header {
            flex-direction: column;
            align-items: stretch;
          }

          .voice-stats {
            justify-content: space-between;
          }

          .session-header {
            flex-direction: column;
            gap: 10px;
          }

          .voice-level-bar {
            width: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceControlPanel;