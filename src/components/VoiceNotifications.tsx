import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Mic, Volume2, Zap, MapPin } from 'lucide-react';
import { useZone } from '../context/ZoneContext';

interface NotificationData {
  id: string;
  type: 'voice_keyword' | 'voice_level' | 'speed_accident' | 'stationary_alert';
  title: string;
  message: string;
  timestamp: Date;
  details?: any;
}

const VoiceNotifications: React.FC = () => {
  const { setSafetyCallbacks } = useZone();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [transcriptUpdates, setTranscriptUpdates] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set up safety callbacks to handle notifications
    setSafetyCallbacks({
      onSpeedAccident: (details: any) => {
        const notification: NotificationData = {
          id: `speed_${Date.now()}`,
          type: 'speed_accident',
          title: '⚡ Speed Incident Detected',
          message: details.type === 'sudden_deceleration' 
            ? `Sudden deceleration: ${details.previousSpeed.toFixed(1)} → ${details.currentSpeed.toFixed(1)} km/h`
            : `Rapid acceleration: ${details.previousSpeed.toFixed(1)} → ${details.currentSpeed.toFixed(1)} km/h`,
          timestamp: new Date(),
          details
        };
        addNotification(notification);
        
        // Play alert sound
        playAlertSound('speed');
        
        // Vibrate if available
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
      },

      onStationaryAlert: (details: any) => {
        const notification: NotificationData = {
          id: `stationary_${Date.now()}`,
          type: 'stationary_alert',
          title: '🚶 Stationary Alert',
          message: `No movement detected for ${details.duration.toFixed(1)} minutes`,
          timestamp: new Date(),
          details
        };
        addNotification(notification);
        
        // Play alert sound
        playAlertSound('stationary');
        
        // Vibrate pattern for stationary
        if ('vibrate' in navigator) {
          navigator.vibrate([500, 200, 500]);
        }
      },

      onVoiceKeyword: (details: any) => {
        const notification: NotificationData = {
          id: `keyword_${details.sessionId}_${Date.now()}`,
          type: 'voice_keyword',
          title: '🎤 Emergency Keyword Detected!',
          message: `"${details.keyword}" detected in session ${details.sessionId}`,
          timestamp: new Date(),
          details
        };
        addNotification(notification);
        
        // Play urgent alert sound
        playAlertSound('emergency');
        
        // Strong vibration pattern
        if ('vibrate' in navigator) {
          navigator.vibrate([300, 100, 300, 100, 300, 100, 300]);
        }
        
        // Flash screen (if supported)
        flashScreen();
      },

      onVoiceLevel: (details: any) => {
        const notification: NotificationData = {
          id: `voice_level_${Date.now()}`,
          type: 'voice_level',
          title: '🔊 High Voice Level Alert',
          message: `Voice level: ${(details.voiceLevel * 100).toFixed(1)}% (Threshold: ${(details.threshold * 100).toFixed(1)}%)`,
          timestamp: new Date(),
          details
        };
        addNotification(notification);
        
        // Play voice level alert
        playAlertSound('voice');
        
        // Vibrate for voice alert
        if ('vibrate' in navigator) {
          navigator.vibrate([150, 50, 150, 50, 150]);
        }
      },

      onTranscriptUpdate: (sessionId: string, transcript: string) => {
        setTranscriptUpdates(prev => ({
          ...prev,
          [sessionId]: transcript
        }));
      }
    });
  }, [setSafetyCallbacks]);

  const addNotification = (notification: NotificationData) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications
    
    // Auto-remove after 30 seconds for non-emergency notifications
    if (notification.type !== 'voice_keyword') {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 30000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const playAlertSound = (type: string) => {
    try {
      // Create audio context for alert sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different sounds for different alert types
      const soundConfig = {
        emergency: { frequency: 800, duration: 1000, pattern: [0.8, 0.2, 0.8, 0.2, 0.8] },
        speed: { frequency: 600, duration: 600, pattern: [0.7, 0.3, 0.7] },
        voice: { frequency: 500, duration: 400, pattern: [0.5, 0.2, 0.5] },
        stationary: { frequency: 400, duration: 800, pattern: [0.6] }
      };

      const config = soundConfig[type as keyof typeof soundConfig] || soundConfig.emergency;
      
      oscillator.frequency.value = config.frequency;
      oscillator.type = 'square';
      
      let time = audioContext.currentTime;
      config.pattern.forEach(volume => {
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, time + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, time + 0.2);
        time += 0.3;
      });

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + config.duration / 1000);
    } catch (error) {
      console.error('Could not play alert sound:', error);
    }
  };

  const flashScreen = () => {
    try {
      const flashOverlay = document.createElement('div');
      flashOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(255, 0, 0, 0.8);
        z-index: 9999;
        pointer-events: none;
        animation: flash 0.5s ease-in-out 3;
      `;
      
      // Add flash animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(flashOverlay);
      
      setTimeout(() => {
        document.body.removeChild(flashOverlay);
        document.head.removeChild(style);
      }, 1500);
    } catch (error) {
      console.error('Could not flash screen:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'voice_keyword': return <AlertTriangle size={20} className="icon-emergency" />;
      case 'voice_level': return <Volume2 size={20} className="icon-voice" />;
      case 'speed_accident': return <Zap size={20} className="icon-speed" />;
      case 'stationary_alert': return <MapPin size={20} className="icon-stationary" />;
      default: return <AlertTriangle size={20} />;
    }
  };

  const getNotificationClass = (type: string) => {
    switch (type) {
      case 'voice_keyword': return 'notification-emergency';
      case 'voice_level': return 'notification-voice';
      case 'speed_accident': return 'notification-speed';
      case 'stationary_alert': return 'notification-stationary';
      default: return 'notification-default';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      <div className="voice-notifications">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`voice-notification ${getNotificationClass(notification.type)}`}
          >
            <div className="notification-content">
              <div className="notification-header">
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-title">
                  {notification.title}
                </div>
                <button 
                  onClick={() => removeNotification(notification.id)}
                  className="notification-close"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="notification-message">
                {notification.message}
              </div>
              
              <div className="notification-time">
                {notification.timestamp.toLocaleTimeString()}
              </div>

              {/* Show additional details for voice keyword alerts */}
              {notification.type === 'voice_keyword' && notification.details && (
                <div className="notification-details">
                  <div className="detail-item">
                    <strong>Session:</strong> {notification.details.sessionId}
                  </div>
                  <div className="detail-item">
                    <strong>Confidence:</strong> {(notification.details.confidence * 100).toFixed(1)}%
                  </div>
                  {notification.details.transcript && (
                    <div className="detail-item">
                      <strong>Transcript:</strong> "{notification.details.transcript}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Live Transcript Display */}
      {Object.keys(transcriptUpdates).length > 0 && (
        <div className="live-transcripts">
          <h4>🎤 Live Voice Recognition</h4>
          {Object.entries(transcriptUpdates).map(([sessionId, transcript]) => (
            transcript && (
              <div key={sessionId} className="transcript-item">
                <div className="transcript-session">{sessionId}:</div>
                <div className="transcript-text">{transcript}</div>
              </div>
            )
          ))}
        </div>
      )}

      <style jsx>{`
        .voice-notifications {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          max-width: 350px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }

        .voice-notification {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          transform: translateX(100%);
          animation: slideIn 0.3s ease-out forwards;
          pointer-events: auto;
          border-left: 4px solid #ccc;
        }

        .notification-emergency {
          border-left-color: #ff4444;
          background: linear-gradient(90deg, #fff5f5, white);
        }

        .notification-voice {
          border-left-color: #ff9800;
          background: linear-gradient(90deg, #fff8f0, white);
        }

        .notification-speed {
          border-left-color: #2196F3;
          background: linear-gradient(90deg, #f0f8ff, white);
        }

        .notification-stationary {
          border-left-color: #9C27B0;
          background: linear-gradient(90deg, #f8f0ff, white);
        }

        .notification-content {
          padding: 15px;
        }

        .notification-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .notification-icon {
          display: flex;
          align-items: center;
        }

        .icon-emergency { color: #ff4444; }
        .icon-voice { color: #ff9800; }
        .icon-speed { color: #2196F3; }
        .icon-stationary { color: #9C27B0; }

        .notification-title {
          font-weight: 600;
          font-size: 14px;
          color: #333;
          flex-grow: 1;
        }

        .notification-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          padding: 2px;
          border-radius: 3px;
        }

        .notification-close:hover {
          background: #f0f0f0;
        }

        .notification-message {
          font-size: 13px;
          color: #555;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .notification-time {
          font-size: 11px;
          color: #888;
        }

        .notification-details {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #eee;
        }

        .detail-item {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .detail-item strong {
          color: #333;
        }

        .live-transcripts {
          position: fixed;
          bottom: 20px;
          right: 20px;
          max-width: 400px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border-radius: 8px;
          padding: 15px;
          backdrop-filter: blur(10px);
          z-index: 999;
        }

        .live-transcripts h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #4CAF50;
        }

        .transcript-item {
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .transcript-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .transcript-session {
          font-size: 11px;
          color: #4CAF50;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .transcript-text {
          font-size: 12px;
          line-height: 1.4;
          font-family: monospace;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .voice-notifications {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }

          .live-transcripts {
            bottom: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }

          .notification-content {
            padding: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default VoiceNotifications;