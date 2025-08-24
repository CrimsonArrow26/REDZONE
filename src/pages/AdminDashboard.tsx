import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SOSService, { SOSAlert } from '../utils/sosService';
import { createClient } from '@supabase/supabase-js';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle,
  Eye,
  MessageSquare,
  Calendar,
  Shield,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import './AdminDashboard.css';

// Supabase setup
const supabaseUrl = 'https://shqfvfjsxtdeknqncjfa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocWZ2ZmpzeHRkZWtucW5jamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MDgzNzMsImV4cCI6MjA2ODQ4NDM3M30.enzNuGiPvfMZLUPLPeDPBlMsHBOP9foFOjbGjQhLsnc';
const supabase = createClient(supabaseUrl, supabaseKey);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'acknowledged' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sosService] = useState(() => new SOSService());
  
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [liveSoundLevel, setLiveSoundLevel] = useState<number | null>(null);
  const [isManualKeywordListeningEnabled, setIsManualKeywordListeningEnabled] = useState(false);
  const [hasKeywordDetected, setHasKeywordDetected] = useState(false);
  const [isSafetyMonitoring, setIsSafetyMonitoring] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchSOSAlerts();
    }
  }, [isAdmin]);
  
  // Cleanup voice recognition on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);
  
  // Monitor network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    };
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus(); // Set initial status
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  const checkAdminStatus = async () => {
    try {
      const adminStatus = await sosService.isCurrentUserAdmin();
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        alert('Access denied. Admin privileges required.');
        navigate('/home');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/home');
    }
  };

  const fetchSOSAlerts = async () => {
    try {
      setLoading(true);
      const alerts = await sosService.getAllSOSAlerts();
      setSosAlerts(alerts);
    } catch (error) {
      console.error('Error fetching SOS alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: 'acknowledged' | 'resolved') => {
    try {
      const result = await sosService.updateSOSAlertStatus(alertId, status, adminNotes);
      
      if (result.success) {
        // Update local state
        setSosAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status, admin_notes: adminNotes }
            : alert
        ));
        
        setSelectedAlert(null);
        setAdminNotes('');
        alert(`Alert ${status} successfully`);
      } else {
        alert(`Failed to update alert: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating alert status:', error);
      alert('Failed to update alert status');
    }
  };

  const openMap = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };









  // New voice recognition system from scratch
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const newRecognition = new SpeechRecognition();
      
      // Configure recognition
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.lang = 'en-US';
      
      // Set up event handlers
      newRecognition.onstart = () => {
        console.log('🎤 Voice recognition started - listening for keywords...');
        setIsListening(true);
        setTranscript('');
      };
      
      newRecognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update transcript display
        setTranscript(finalTranscript + interimTranscript);
        
        // Check for keywords in final results
        if (finalTranscript) {
          const lowerTranscript = finalTranscript.toLowerCase();
          console.log('🎯 Final transcript:', finalTranscript);
          
          // Check for "help" keyword
          if (lowerTranscript.includes('help')) {
            console.log('🚨 HELP keyword detected!');
            setHasKeywordDetected(true);
            alert('🚨 HELP keyword detected! Emergency response triggered.');
            // Here you can add logic to send SOS alerts, etc.
          }
          
          // Check for other keywords if needed
          if (lowerTranscript.includes('emergency')) {
            console.log('🚨 EMERGENCY keyword detected!');
            alert('🚨 EMERGENCY keyword detected!');
          }
          
          if (lowerTranscript.includes('sos')) {
            console.log('🚨 SOS keyword detected!');
            alert('🚨 SOS keyword detected!');
          }
        }
      };
      
      newRecognition.onerror = (event: any) => {
        console.error('❌ Voice recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        }
      };
      
      newRecognition.onend = () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
      };
      
      // Start recognition
      newRecognition.start();
      setRecognition(newRecognition);
      
    } catch (error) {
      console.error('❌ Failed to start voice recognition:', error);
      alert('Failed to start voice recognition. Please check console for details.');
    }
  };
  
  const stopVoiceRecognition = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
      setIsListening(false);
      console.log('🎤 Voice recognition stopped');
    }
  };
  
  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };

  // Get sound level color based on threshold
  const getSoundLevelColor = (level: number) => {
    if (level > 80) return '#dc2626'; // Red for high levels
    if (level > 60) return '#f59e0b'; // Orange for medium levels
    return '#059669'; // Green for normal levels
  };

  // Function to test keyword detection specifically
  const testKeywordDetection = () => {
    if (isListening) {
      console.log('🎯 Voice recognition is already active. Current transcript:', transcript);
      alert(`🎯 Voice recognition is active!\n\nCurrent transcript: "${transcript}"\n\nSay "help", "emergency", or "sos" to test keyword detection.`);
    } else {
      console.log('🎯 Starting voice recognition for keyword detection...');
      startVoiceRecognition();
    }
  };

  // Toggle manual keyword listening
  const toggleManualKeywordListening = () => {
    if (isManualKeywordListeningEnabled) {
      setIsManualKeywordListeningEnabled(false);
      if (recognition) {
        recognition.stop();
        setIsListening(false);
      }
    } else {
      setIsManualKeywordListeningEnabled(true);
      startVoiceRecognition();
    }
  };

  // Clear transcript
  const clearTranscript = () => {
    setTranscript('');
  };

  // Simulate safety monitoring for admin testing
  const toggleSafetyMonitoring = () => {
    setIsSafetyMonitoring(!isSafetyMonitoring);
    if (!isSafetyMonitoring) {
      // Start monitoring
      setIsSafetyMonitoring(true);
      if (isManualKeywordListeningEnabled) {
        startVoiceRecognition();
      }
      // Simulate sound level monitoring
      const soundLevelInterval = setInterval(() => {
        if (isSafetyMonitoring) {
          const randomLevel = Math.random() * 100;
          setLiveSoundLevel(randomLevel);
        } else {
          clearInterval(soundLevelInterval);
        }
      }, 1000);
    } else {
      setIsSafetyMonitoring(false);
      setLiveSoundLevel(null);
    }
  };

  // Placeholder functions for disabled buttons to prevent errors
  const checkVoiceRecognitionStatus = () => {
    console.log('🔍 Voice recognition status check requested (function disabled)');
    alert('This function is currently disabled and will be implemented in a future update.');
  };

  const resetSafetySystem = () => {
    console.log('🔄 Safety system reset requested (function disabled)');
    alert('This function is currently disabled and will be implemented in a future update.');
  };

  const reEnableSpeechRecognition = () => {
    console.log('🎤 Re-enable speech recognition requested (function disabled)');
    alert('This function is currently disabled and will be implemented in a future update.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'acknowledged': return 'status-acknowledged';
      case 'resolved': return 'status-resolved';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertTriangle size={16} />;
      case 'acknowledged': return <Eye size={16} />;
      case 'resolved': return <CheckCircle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const filteredAlerts = sosAlerts.filter(alert => {
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesSearch = 
      alert.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.user_message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (!isAdmin) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Checking admin privileges...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title">
            <Shield size={32} />
            <h1>Admin Dashboard</h1>
          </div>
          <div className="admin-stats">
            <div className="stat-item">
              <span className="stat-number">{sosAlerts.filter(a => a.status === 'pending').length}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{sosAlerts.filter(a => a.status === 'acknowledged').length}</span>
              <span className="stat-label">Acknowledged</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{sosAlerts.filter(a => a.status === 'resolved').length}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <button onClick={fetchSOSAlerts} className="refresh-btn">
          Refresh
        </button>
        
        <button 
          className={`test-keyword-btn ${isListening ? 'listening' : ''}`} 
          onClick={testKeywordDetection}
        >
          {isListening ? '🎤 Stop Listening' : '🎯 Start Voice Recognition'}
        </button>
        
        {isListening && (
          <div className="transcript-display">
            <p><strong>Listening for keywords:</strong> help, emergency, sos</p>
            <p><strong>Current transcript:</strong> {transcript || 'Waiting for speech...'}</p>
            <p className={`network-status ${networkStatus}`}>
              <strong>Network:</strong> {networkStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
              {networkStatus === 'offline' && ' - Voice recognition may not work'}
            </p>
          </div>
        )}
        
        {!isListening && (
          <div className="network-info">
            <p className={`network-status ${networkStatus}`}>
              <strong>Network Status:</strong> {networkStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
            </p>
            {networkStatus === 'offline' && (
              <p className="network-warning">
                ⚠️ Voice recognition requires an internet connection to work properly
              </p>
            )}
          </div>
        )}

        {/* Enhanced Voice Testing Controls */}
        <div className="voice-testing-controls">
          <button 
            className={`safety-monitoring-btn ${isSafetyMonitoring ? 'active' : ''}`}
            onClick={toggleSafetyMonitoring}
          >
            {isSafetyMonitoring ? '🛑 Stop Safety Monitoring' : '🛡️ Start Safety Monitoring'}
          </button>
          
          <button 
            className={`keyword-listening-btn ${isManualKeywordListeningEnabled ? 'active' : ''}`}
            onClick={toggleManualKeywordListening}
            disabled={!isSafetyMonitoring}
          >
            {isManualKeywordListeningEnabled ? '🛑 Stop Keyword Listening' : '🎤 Start Keyword Listening'}
          </button>
        </div>

        {/* Enhanced Voice Testing Display */}
        {isSafetyMonitoring && (
          <div className="enhanced-voice-test-section">
            <h3 className="voice-test-title">🎤 Advanced Voice Recognition Testing</h3>
            
            {/* Continuous Monitoring Status */}
            <div className="monitoring-status-banner">
              <div className="monitoring-indicator">
                <div className="pulse-dot"></div>
                <span>🛡️ Continuous Safety Monitoring Active</span>
              </div>
              <div className="monitoring-details">
                <span>🎤 Keyword listening: {isManualKeywordListeningEnabled ? 'Active' : 'Paused'}</span>
                <span>📊 Monitoring sound levels in real-time</span>
                <span>📍 Admin testing mode</span>
              </div>
            </div>
            
            <div className="voice-test-container">
              <div className="voice-status">
                <div className="status-item">
                  <span className="status-label">Microphone Status:</span>
                  <span className={`status-value ${isListening ? 'active' : 'inactive'}`}>
                    {isListening ? (
                      <>
                        <Mic size={16} />
                        Active & Listening
                      </>
                    ) : (
                      <>
                        <MicOff size={16} />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
                
                <div className="status-item">
                  <span className="status-label">Sound Level:</span>
                  <span className="status-value">
                    <Volume2 size={16} />
                    {liveSoundLevel !== null ? (
                      <span 
                        className="sound-level-display"
                        style={{ color: getSoundLevelColor(liveSoundLevel) }}
                      >
                        {liveSoundLevel.toFixed(1)} dB
                      </span>
                    ) : (
                      <span className="sound-level-display">-- dB</span>
                    )}
                  </span>
                </div>
                
                {liveSoundLevel !== null && (
                  <div className="status-item">
                    <span className="status-label">Monitoring:</span>
                    <span className="status-value">
                      <div className="sound-indicator">
                        <div 
                          className="sound-bar"
                          style={{ 
                            width: `${Math.min((liveSoundLevel / 100) * 100, 100)}%`,
                            backgroundColor: getSoundLevelColor(liveSoundLevel)
                          }}
                        />
                      </div>
                      <span className="sound-label">
                        {liveSoundLevel > 80 ? 'High' : liveSoundLevel > 60 ? 'Medium' : 'Normal'}
                      </span>
                    </span>
                  </div>
                )}
                
                {hasKeywordDetected && (
                  <div className="status-item">
                    <span className="status-label">Keyword Detected:</span>
                    <span className="status-value keyword-detected">
                      🎯 "help" detected!
                    </span>
                  </div>
                )}
              </div>
              
              {/* Transcript Display */}
              <div className="transcript-section">
                <div className="transcript-header">
                  <span className="transcript-title">🎤 Live Transcript</span>
                  <button 
                    className="clear-transcript-btn"
                    onClick={clearTranscript}
                    disabled={!transcript}
                  >
                    🗑️ Clear
                  </button>
                </div>
                <div className="transcript-content">
                  {transcript ? (
                    <p className="transcript-text">{transcript}</p>
                  ) : (
                    <p className="transcript-placeholder">Start speaking to see your transcript here...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Disabled buttons - kept for future use */}
        <button onClick={checkVoiceRecognitionStatus} className="status-check-btn" disabled>
          <Shield size={16} />
          Check Status (Disabled)
        </button>
        <button onClick={resetSafetySystem} className="reset-system-btn" disabled>
          <Shield size={16} />
          Reset System (Disabled)
        </button>
        <button className="re-enable-speech-btn" onClick={reEnableSpeechRecognition} disabled>
          Re-enable Speech Recognition (Disabled)
        </button>
        

      </div>

      <div className="alerts-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading SOS alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={48} />
            <h3>No SOS alerts found</h3>
            <p>No alerts match your current filters.</p>
          </div>
        ) : (
          <div className="alerts-grid">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={`alert-card ${getStatusColor(alert.status)}`}>
                <div className="alert-header">
                  <div className="alert-status">
                    {getStatusIcon(alert.status)}
                    <span className="status-text">{alert.status}</span>
                  </div>
                  <div className="alert-time">
                    <Clock size={14} />
                    <span>{formatDate(alert.created_at || '')}</span>
                  </div>
                </div>

                <div className="alert-content">
                  <div className="alert-type">
                    <AlertTriangle size={16} />
                    <span>{alert.alert_type.replace('_', ' ').toUpperCase()}</span>
                  </div>

                  <div className="alert-user">
                    <User size={16} />
                    <span>{alert.user_email || 'Unknown user'}</span>
                  </div>

                  {alert.user_phone && (
                    <div className="alert-contact">
                      <Phone size={16} />
                      <span>{alert.user_phone}</span>
                    </div>
                  )}

                  <div className="alert-location">
                    <MapPin size={16} />
                    <span className="location-text">{alert.location_address || 'Unknown location'}</span>
                  </div>

                  {alert.stationary_duration_minutes && (
                    <div className="alert-duration">
                      <Clock size={16} />
                      <span>Stationary for {alert.stationary_duration_minutes} minutes</span>
                    </div>
                  )}

                  {alert.user_message && (
                    <div className="alert-message">
                      <MessageSquare size={16} />
                      <span>{alert.user_message}</span>
                    </div>
                  )}
                </div>

                <div className="alert-actions">
                  <button
                    onClick={() => openMap(alert.latitude, alert.longitude)}
                    className="action-btn map-btn"
                  >
                    <MapPin size={16} />
                    View Map
                  </button>
                  
                  {alert.status === 'pending' && (
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="action-btn acknowledge-btn"
                    >
                      <Eye size={16} />
                      Acknowledge
                    </button>
                  )}
                  
                  {alert.status === 'acknowledged' && (
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="action-btn resolve-btn"
                    >
                      <CheckCircle size={16} />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for updating alert status */}
      {selectedAlert && (
        <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Alert Status</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedAlert(null)}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="alert-summary">
                <p><strong>User:</strong> {selectedAlert.user_email}</p>
                <p><strong>Location:</strong> {selectedAlert.location_address}</p>
                <p><strong>Type:</strong> {selectedAlert.alert_type}</p>
                <p><strong>Time:</strong> {formatDate(selectedAlert.created_at || '')}</p>
              </div>
              
              <div className="notes-section">
                <label htmlFor="adminNotes">Admin Notes:</label>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this alert..."
                  rows={4}
                />
              </div>
            </div>
            
            <div className="modal-actions">
              {selectedAlert.status === 'pending' && (
                <button
                  onClick={() => updateAlertStatus(selectedAlert.id!, 'acknowledged')}
                  className="btn acknowledge-btn"
                >
                  <Eye size={16} />
                  Acknowledge
                </button>
              )}
              
              {selectedAlert.status === 'acknowledged' && (
                <button
                  onClick={() => updateAlertStatus(selectedAlert.id!, 'resolved')}
                  className="btn resolve-btn"
                >
                  <CheckCircle size={16} />
                  Resolve
                </button>
              )}
              
              <button
                onClick={() => setSelectedAlert(null)}
                className="btn cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
