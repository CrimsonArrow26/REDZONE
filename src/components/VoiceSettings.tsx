import React, { useState, useEffect } from 'react';
import { Settings, Volume, VolumeX, Mic, Activity, Save, RotateCcw } from 'lucide-react';

interface VoiceSettingsProps {
  onSettingsChange: (settings: VoiceSettings) => void;
  currentSettings: VoiceSettings;
}

export interface VoiceSettings {
  confidenceThreshold: number;
  voiceLevelThreshold: number;
  noiseSuppressionEnabled: boolean;
  echoCancellationEnabled: boolean;
  autoGainControlEnabled: boolean;
  continuousListening: boolean;
  keywordSensitivity: 'low' | 'medium' | 'high';
  languageDetection: boolean;
  backgroundNoiseThreshold: number;
  sessionTimeout: number; // minutes
}

const DEFAULT_SETTINGS: VoiceSettings = {
  confidenceThreshold: 0.7,
  voiceLevelThreshold: 0.8,
  noiseSuppressionEnabled: true,
  echoCancellationEnabled: true,
  autoGainControlEnabled: true,
  continuousListening: true,
  keywordSensitivity: 'medium',
  languageDetection: false,
  backgroundNoiseThreshold: 0.3,
  sessionTimeout: 30
};

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  onSettingsChange,
  currentSettings
}) => {
  const [settings, setSettings] = useState<VoiceSettings>(currentSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState<{
    microphoneLevel: number;
    backgroundNoise: number;
    processingDelay: number;
  } | null>(null);

  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(currentSettings);
    setHasChanges(hasChanges);
  }, [settings, currentSettings]);

  const updateSetting = <K extends keyof VoiceSettings>(
    key: K,
    value: VoiceSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    onSettingsChange(settings);
    setHasChanges(false);
  };

  const handleResetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const runAudioTest = async () => {
    setTestMode(true);
    setTestResults(null);

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: settings.echoCancellationEnabled,
          noiseSuppression: settings.noiseSuppressionEnabled,
          autoGainControl: settings.autoGainControlEnabled
        }
      });

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Test for 3 seconds
      const testDuration = 3000;
      const testInterval = 100;
      let samples = 0;
      let totalLevel = 0;
      let maxLevel = 0;
      let backgroundNoiseLevel = 0;

      const startTime = Date.now();
      
      const testLoop = () => {
        if (Date.now() - startTime < testDuration) {
          analyser.getByteFrequencyData(dataArray);
          
          // Calculate average volume
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          
          const avgLevel = sum / bufferLength / 255;
          totalLevel += avgLevel;
          maxLevel = Math.max(maxLevel, avgLevel);
          samples++;

          // First 500ms considered background noise
          if (Date.now() - startTime < 500) {
            backgroundNoiseLevel = avgLevel;
          }

          setTimeout(testLoop, testInterval);
        } else {
          // Test complete
          const avgLevel = totalLevel / samples;
          const processingDelay = Date.now() - startTime - testDuration;

          setTestResults({
            microphoneLevel: maxLevel,
            backgroundNoise: backgroundNoiseLevel,
            processingDelay: Math.max(0, processingDelay)
          });

          // Cleanup
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          setTestMode(false);
        }
      };

      testLoop();
    } catch (error) {
      console.error('Audio test failed:', error);
      setTestMode(false);
      alert('Microphone access denied or not available');
    }
  };

  const getSensitivityDescription = (sensitivity: string) => {
    switch (sensitivity) {
      case 'low': return 'Less sensitive - reduces false positives';
      case 'medium': return 'Balanced - recommended for most users';
      case 'high': return 'Very sensitive - may trigger more often';
      default: return '';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4CAF50'; // Green - Very reliable
    if (confidence >= 0.6) return '#FF9800'; // Orange - Moderate
    return '#f44336'; // Red - Low confidence
  };

  return (
    <div className="voice-settings">
      <div className="settings-header">
        <h3>
          <Settings size={20} />
          Voice Recognition Settings
        </h3>
        <div className="settings-actions">
          <button 
            onClick={runAudioTest} 
            disabled={testMode}
            className="test-btn"
          >
            {testMode ? (
              <>
                <Activity size={16} className="spinning" />
                Testing...
              </>
            ) : (
              <>
                <Mic size={16} />
                Audio Test
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="test-results">
          <h4>🔍 Audio Test Results</h4>
          <div className="test-metrics">
            <div className="metric">
              <span className="metric-label">Microphone Level:</span>
              <span className="metric-value">
                {(testResults.microphoneLevel * 100).toFixed(1)}%
              </span>
              <div className="metric-bar">
                <div 
                  className="metric-fill"
                  style={{ 
                    width: `${testResults.microphoneLevel * 100}%`,
                    backgroundColor: testResults.microphoneLevel > 0.5 ? '#4CAF50' : '#ff9800'
                  }}
                />
              </div>
            </div>
            <div className="metric">
              <span className="metric-label">Background Noise:</span>
              <span className="metric-value">
                {(testResults.backgroundNoise * 100).toFixed(1)}%
              </span>
              <div className="metric-bar">
                <div 
                  className="metric-fill"
                  style={{ 
                    width: `${testResults.backgroundNoise * 100}%`,
                    backgroundColor: testResults.backgroundNoise < 0.3 ? '#4CAF50' : '#ff9800'
                  }}
                />
              </div>
            </div>
            <div className="metric">
              <span className="metric-label">Processing Delay:</span>
              <span className="metric-value">{testResults.processingDelay}ms</span>
            </div>
          </div>
          <div className="test-recommendations">
            {testResults.microphoneLevel < 0.3 && (
              <p className="warning">⚠️ Microphone level is low. Consider adjusting position or volume.</p>
            )}
            {testResults.backgroundNoise > 0.4 && (
              <p className="warning">⚠️ High background noise detected. Enable noise suppression.</p>
            )}
            {testResults.processingDelay > 200 && (
              <p className="warning">⚠️ High processing delay. Consider reducing quality settings.</p>
            )}
          </div>
        </div>
      )}

      <div className="settings-sections">
        {/* Recognition Sensitivity */}
        <div className="settings-section">
          <h4>🎯 Recognition Sensitivity</h4>
          
          <div className="setting-row">
            <label>Confidence Threshold:</label>
            <div className="slider-container">
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={settings.confidenceThreshold}
                onChange={(e) => updateSetting('confidenceThreshold', parseFloat(e.target.value))}
                className="setting-slider"
              />
              <span 
                className="slider-value"
                style={{ color: getConfidenceColor(settings.confidenceThreshold) }}
              >
                {(settings.confidenceThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <p className="setting-description">
              How confident the system should be before triggering alerts
            </p>
          </div>

          <div className="setting-row">
            <label>Voice Level Threshold:</label>
            <div className="slider-container">
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={settings.voiceLevelThreshold}
                onChange={(e) => updateSetting('voiceLevelThreshold', parseFloat(e.target.value))}
                className="setting-slider"
              />
              <span className="slider-value">
                {(settings.voiceLevelThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <p className="setting-description">
              Voice volume threshold for distress detection
            </p>
          </div>

          <div className="setting-row">
            <label>Keyword Sensitivity:</label>
            <div className="radio-group">
              {(['low', 'medium', 'high'] as const).map(level => (
                <label key={level} className="radio-option">
                  <input
                    type="radio"
                    name="sensitivity"
                    value={level}
                    checked={settings.keywordSensitivity === level}
                    onChange={() => updateSetting('keywordSensitivity', level)}
                  />
                  <span className="radio-label">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                </label>
              ))}
            </div>
            <p className="setting-description">
              {getSensitivityDescription(settings.keywordSensitivity)}
            </p>
          </div>
        </div>

        {/* Audio Processing */}
        <div className="settings-section">
          <h4>🎙️ Audio Processing</h4>
          
          <div className="setting-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.noiseSuppressionEnabled}
                onChange={(e) => updateSetting('noiseSuppressionEnabled', e.target.checked)}
              />
              <span className="checkmark"></span>
              Noise Suppression
            </label>
            <p className="setting-description">
              Reduces background noise for clearer voice recognition
            </p>
          </div>

          <div className="setting-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.echoCancellationEnabled}
                onChange={(e) => updateSetting('echoCancellationEnabled', e.target.checked)}
              />
              <span className="checkmark"></span>
              Echo Cancellation
            </label>
            <p className="setting-description">
              Removes echo and feedback from speakers
            </p>
          </div>

          <div className="setting-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.autoGainControlEnabled}
                onChange={(e) => updateSetting('autoGainControlEnabled', e.target.checked)}
              />
              <span className="checkmark"></span>
              Auto Gain Control
            </label>
            <p className="setting-description">
              Automatically adjusts microphone sensitivity
            </p>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="settings-section">
          <h4>⚙️ Advanced</h4>
          
          <div className="setting-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.continuousListening}
                onChange={(e) => updateSetting('continuousListening', e.target.checked)}
              />
              <span className="checkmark"></span>
              Continuous Listening
            </label>
            <p className="setting-description">
              Keep voice recognition active even when not speaking
            </p>
          </div>

          <div className="setting-row">
            <label>Session Timeout:</label>
            <div className="slider-container">
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                className="setting-slider"
              />
              <span className="slider-value">
                {settings.sessionTimeout} min
              </span>
            </div>
            <p className="setting-description">
              Automatically restart sessions after this time
            </p>
          </div>

          <div className="setting-row">
            <label>Background Noise Threshold:</label>
            <div className="slider-container">
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={settings.backgroundNoiseThreshold}
                onChange={(e) => updateSetting('backgroundNoiseThreshold', parseFloat(e.target.value))}
                className="setting-slider"
              />
              <span className="slider-value">
                {(settings.backgroundNoiseThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <p className="setting-description">
              Ignore sounds below this level as background noise
            </p>
          </div>
        </div>
      </div>

      {/* Save Controls */}
      <div className="settings-footer">
        <button 
          onClick={handleResetToDefaults}
          className="reset-btn"
        >
          <RotateCcw size={16} />
          Reset to Defaults
        </button>
        
        <button 
          onClick={handleSaveSettings}
          disabled={!hasChanges}
          className={`save-btn ${hasChanges ? 'has-changes' : ''}`}
        >
          <Save size={16} />
          {hasChanges ? 'Save Changes' : 'No Changes'}
        </button>
      </div>

      <style jsx>{`
        .voice-settings {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .settings-header h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          color: #333;
        }

        .settings-actions {
          display: flex;
          gap: 10px;
        }

        .test-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #ff9800;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .test-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .test-btn:hover:not(:disabled) {
          background: #f57c00;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .test-results {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          border-left: 4px solid #4CAF50;
        }

        .test-results h4 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .test-metrics {
          display: grid;
          gap: 12px;
          margin-bottom: 15px;
        }

        .metric {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
        }

        .metric-label {
          font-size: 13px;
          color: #555;
          font-weight: 500;
        }

        .metric-value {
          font-size: 13px;
          color: #333;
          font-weight: 600;
        }

        .metric-bar {
          grid-column: 1 / -1;
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
        }

        .metric-fill {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .test-recommendations .warning {
          color: #ff9800;
          font-size: 12px;
          margin: 5px 0;
        }

        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .settings-section {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
        }

        .settings-section h4 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 16px;
        }

        .setting-row {
          margin-bottom: 20px;
        }

        .setting-row:last-child {
          margin-bottom: 0;
        }

        .setting-row > label {
          display: block;
          font-weight: 500;
          color: #555;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .setting-slider {
          flex-grow: 1;
          height: 6px;
          border-radius: 3px;
          background: #e0e0e0;
          outline: none;
          -webkit-appearance: none;
        }

        .setting-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2196F3;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
        }

        .setting-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2196F3;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
        }

        .slider-value {
          min-width: 50px;
          text-align: center;
          font-weight: 600;
          font-size: 13px;
          color: #333;
        }

        .radio-group {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .radio-option input[type="radio"] {
          margin: 0;
        }

        .radio-label {
          font-size: 13px;
          color: #555;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 500;
          color: #555;
          font-size: 14px;
        }

        .checkbox-label input[type="checkbox"] {
          margin: 0;
        }

        .setting-description {
          font-size: 12px;
          color: #666;
          margin: 8px 0 0 0;
          line-height: 1.4;
        }

        .settings-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .reset-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: none;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          background: #f5f5f5;
          border-color: #ccc;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #ddd;
          color: #666;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }

        .save-btn.has-changes {
          background: #4CAF50;
          color: white;
          cursor: pointer;
        }

        .save-btn:disabled {
          cursor: not-allowed;
        }

        .save-btn.has-changes:hover {
          background: #45a049;
        }

        @media (max-width: 768px) {
          .settings-header {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }

          .test-metrics {
            grid-template-columns: 1fr;
          }

          .slider-container {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .radio-group {
            flex-direction: column;
            gap: 8px;
          }

          .settings-footer {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceSettings;
export { DEFAULT_SETTINGS };