import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertTriangle, MapPin, Speed, Activity } from 'lucide-react';
import SOSService from '../utils/sosService';
import './EnhancedSafetyMonitoring.css';

interface EnhancedSafetyMonitoringProps {
  isInRedZone: boolean;
  currentLocation: { lat: number; lng: number } | null;
}

const EnhancedSafetyMonitoring: React.FC<EnhancedSafetyMonitoringProps> = ({
  isInRedZone,
  currentLocation
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [liveSoundLevel, setLiveSoundLevel] = useState<number | null>(null);
  const [isSafetyMonitoring, setIsSafetyMonitoring] = useState(false);
  const [hasKeywordDetected, setHasKeywordDetected] = useState(false);
  const [speedData, setSpeedData] = useState<{ current: number; max: number; acceleration: number } | null>(null);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isDecelerating, setIsDecelerating] = useState(false);
  const [isSuddenStop, setIsSuddenStop] = useState(false);
  const [isSuddenStart, setIsSuddenStart] = useState(false);
  
  const sosService = useRef(new SOSService());
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    initializeSOSService();
    return () => {
      cleanupVoiceRecognition();
      cleanupAudioMonitoring();
    };
  }, []);

  useEffect(() => {
    if (isInRedZone) {
      startContinuousVoiceMonitoring();
      startSpeedMonitoring();
    } else {
      stopContinuousVoiceMonitoring();
      stopSpeedMonitoring();
    }
  }, [isInRedZone]);

  const initializeSOSService = async () => {
    try {
      await sosService.current.initialize();
    } catch (error) {
      console.error('Failed to initialize SOS service:', error);
    }
  };

  // Voice Recognition System
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const newRecognition = new SpeechRecognition();
      
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.lang = 'en-US';
      
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
        
        setTranscript(finalTranscript + interimTranscript);
        
        if (finalTranscript) {
          const lowerTranscript = finalTranscript.toLowerCase();
          console.log('🎯 Final transcript:', finalTranscript);
          
          // Check for emergency keywords
          if (lowerTranscript.includes('help') || lowerTranscript.includes('emergency') || 
              lowerTranscript.includes('sos') || lowerTranscript.includes('danger')) {
            console.log('🚨 Emergency keyword detected!');
            setHasKeywordDetected(true);
            triggerEmergencyResponse();
          }
        }
      };
      
      newRecognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        setIsListening(false);
      };
      
      newRecognition.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
        // Restart if in red zone
        if (isInRedZone) {
          setTimeout(() => startVoiceRecognition(), 1000);
        }
      };
      
      setRecognition(newRecognition);
      newRecognition.start();
      
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  };

  const stopVoiceRecognition = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const cleanupVoiceRecognition = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  // Continuous Voice Monitoring in Red Zones
  const startContinuousVoiceMonitoring = () => {
    if (isInRedZone) {
      startVoiceRecognition();
      startAudioLevelMonitoring();
    }
  };

  const stopContinuousVoiceMonitoring = () => {
    stopVoiceRecognition();
    stopAudioLevelMonitoring();
  };

  // Audio Level Monitoring
  const startAudioLevelMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      microphone.current = audioContext.current.createMediaStreamSource(stream);
      
      analyser.current.fftSize = 256;
      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      microphone.current.connect(analyser.current);
      
      const updateAudioLevel = () => {
        if (analyser.current && isInRedZone) {
          analyser.current.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setLiveSoundLevel(average);
          
          // Check for sudden loud sounds (potential danger)
          if (average > 150) {
            console.log('🚨 Loud sound detected!');
            triggerEmergencyResponse();
          }
          
          animationFrame.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error starting audio monitoring:', error);
    }
  };

  const stopAudioLevelMonitoring = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    if (microphone.current) {
      microphone.current.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext.current) {
      audioContext.current.close();
    }
    setLiveSoundLevel(null);
  };

  const cleanupAudioMonitoring = () => {
    stopAudioLevelMonitoring();
  };

  // Speed and Movement Monitoring
  const startSpeedMonitoring = () => {
    if ('DeviceMotionEvent' in window) {
      let lastAcceleration = { x: 0, y: 0, z: 0 };
      let lastTime = Date.now();
      
      const handleMotion = (event: DeviceMotionEvent) => {
        if (event.accelerationIncludingGravity) {
          const { x, y, z } = event.accelerationIncludingGravity;
          const currentTime = Date.now();
          const timeDelta = currentTime - lastTime;
          
          if (x && y && z && timeDelta > 0) {
            const acceleration = Math.sqrt(x * x + y * y + z * z);
            const speed = acceleration * timeDelta / 1000; // Convert to m/s
            
            setSpeedData({
              current: speed,
              max: Math.max(speed, speedData?.max || 0),
              acceleration: acceleration
            });
            
            // Detect sudden acceleration/deceleration
            if (acceleration > 20) {
              setIsAccelerating(true);
              setTimeout(() => setIsAccelerating(false), 2000);
            } else if (acceleration < 5 && lastAcceleration.x > 15) {
              setIsDecelerating(true);
              setTimeout(() => setIsDecelerating(false), 2000);
            }
            
            // Detect sudden stops and starts
            if (acceleration < 1 && lastAcceleration.x > 10) {
              setIsSuddenStop(true);
              setTimeout(() => setIsSuddenStop(false), 3000);
            } else if (acceleration > 15 && lastAcceleration.x < 2) {
              setIsSuddenStart(true);
              setTimeout(() => setIsSuddenStart(false), 3000);
            }
            
            lastAcceleration = { x: x, y: y, z: z };
            lastTime = currentTime;
          }
        }
      };
      
      window.addEventListener('devicemotion', handleMotion);
      
      return () => {
        window.removeEventListener('devicemotion', handleMotion);
      };
    }
  };

  const stopSpeedMonitoring = () => {
    setSpeedData(null);
    setIsAccelerating(false);
    setIsDecelerating(false);
    setIsSuddenStop(false);
    setIsSuddenStart(false);
  };

  // Emergency Response
  const triggerEmergencyResponse = async () => {
    try {
      if (currentLocation) {
        const result = await sosService.current.sendStationaryUserAlert(
          currentLocation,
          0,
          'Emergency keyword or loud sound detected'
        );
        
        if (result.success) {
          console.log('🚨 Emergency SOS alert sent successfully');
          alert('🚨 Emergency alert sent! Help is on the way.');
        } else {
          console.error('Failed to send emergency alert:', result.error);
        }
      }
    } catch (error) {
      console.error('Error triggering emergency response:', error);
    }
  };

  // Manual Safety Monitoring Toggle
  const toggleSafetyMonitoring = () => {
    if (isSafetyMonitoring) {
      stopVoiceRecognition();
      stopAudioLevelMonitoring();
      setIsSafetyMonitoring(false);
    } else {
      startVoiceRecognition();
      startAudioLevelMonitoring();
      setIsSafetyMonitoring(true);
    }
  };

  return (
    <div className="enhanced-safety-monitoring">
      <div className="safety-header">
        <h3>🛡️ Enhanced Safety Monitoring</h3>
        <div className="safety-status">
          {isInRedZone && <span className="redzone-indicator">🚨 IN RED ZONE</span>}
        </div>
      </div>

      {/* Voice Recognition Controls */}
      <div className="safety-section">
        <div className="section-header">
          <Mic size={20} />
          <span>Voice Recognition</span>
        </div>
        <div className="controls">
          <button
            onClick={toggleSafetyMonitoring}
            className={`control-btn ${isSafetyMonitoring ? 'active' : ''}`}
          >
            {isSafetyMonitoring ? <MicOff size={16} /> : <Mic size={16} />}
            {isSafetyMonitoring ? 'Stop' : 'Start'} Monitoring
          </button>
          {isListening && <span className="status-indicator listening">🎤 Listening...</span>}
        </div>
        {transcript && (
          <div className="transcript-display">
            <strong>Transcript:</strong> {transcript}
          </div>
        )}
        {hasKeywordDetected && (
          <div className="keyword-alert">
            🚨 Emergency keyword detected! SOS alert sent.
          </div>
        )}
      </div>

      {/* Audio Level Monitoring */}
      {isInRedZone && (
        <div className="safety-section">
          <div className="section-header">
            <Volume2 size={20} />
            <span>Audio Level Monitoring</span>
          </div>
          {liveSoundLevel !== null && (
            <div className="audio-level">
              <div className="level-bar">
                <div 
                  className="level-fill" 
                  style={{ width: `${(liveSoundLevel / 255) * 100}%` }}
                ></div>
              </div>
              <span className="level-value">{liveSoundLevel}</span>
            </div>
          )}
        </div>
      )}

      {/* Speed and Movement Monitoring */}
      {isInRedZone && (
        <div className="safety-section">
          <div className="section-header">
            <Speed size={20} />
            <span>Movement Monitoring</span>
          </div>
          {speedData && (
            <div className="speed-data">
              <div className="data-item">
                <span>Current Speed:</span>
                <span className="value">{speedData.current.toFixed(2)} m/s</span>
              </div>
              <div className="data-item">
                <span>Max Speed:</span>
                <span className="value">{speedData.max.toFixed(2)} m/s</span>
              </div>
              <div className="data-item">
                <span>Acceleration:</span>
                <span className="value">{speedData.acceleration.toFixed(2)} m/s²</span>
              </div>
            </div>
          )}
          
          {/* Movement Alerts */}
          <div className="movement-alerts">
            {isAccelerating && <div className="alert accelerating">🚀 Sudden Acceleration</div>}
            {isDecelerating && <div className="alert decelerating">🛑 Sudden Deceleration</div>}
            {isSuddenStop && <div className="alert sudden-stop">⛔ Sudden Stop</div>}
            {isSuddenStart && <div className="alert sudden-start">🚀 Sudden Start</div>}
          </div>
        </div>
      )}

      {/* Location Display */}
      <div className="safety-section">
        <div className="section-header">
          <MapPin size={20} />
          <span>Current Location</span>
        </div>
        {currentLocation ? (
          <div className="location-display">
            <span>Lat: {currentLocation.lat.toFixed(6)}</span>
            <span>Lng: {currentLocation.lng.toFixed(6)}</span>
          </div>
        ) : (
          <span className="no-location">Location not available</span>
        )}
      </div>

      {/* Safety Tips */}
      <div className="safety-tips">
        <h4>💡 Safety Tips</h4>
        <ul>
          <li>Speak clearly when using voice commands</li>
          <li>Stay alert in red zones</li>
          <li>Report any suspicious activity</li>
          <li>Keep your phone charged for emergency alerts</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedSafetyMonitoring;
