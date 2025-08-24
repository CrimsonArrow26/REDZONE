import React, { useState } from 'react';
import { Play, Star, Globe, Users, Shield, Brain, Plus, Check } from 'lucide-react';
import { VOICE_TEMPLATES, VoiceTemplate, getPopularTemplates, getTemplatesByCategory, TEMPLATE_CATEGORIES, createCustomTemplate, mergeTemplates } from '../utils/voiceTemplates';

interface VoiceTemplateSelectorProps {
  onSelectTemplate: (template: VoiceTemplate) => void;
  onCreateCustom: (template: VoiceTemplate) => void;
  selectedTemplates: string[];
}

const VoiceTemplateSelector: React.FC<VoiceTemplateSelectorProps> = ({
  onSelectTemplate,
  onCreateCustom,
  selectedTemplates
}) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'category' | 'custom'>('popular');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof TEMPLATE_CATEGORIES>('EMERGENCY');
  const [customName, setCustomName] = useState('');
  const [customKeywords, setCustomKeywords] = useState('');
  const [customLanguage, setCustomLanguage] = useState('en-US');
  const [mergeMode, setMergeMode] = useState(false);
  const [templatesForMerge, setTemplatesForMerge] = useState<string[]>([]);

  const getCategoryIcon = (category: keyof typeof TEMPLATE_CATEGORIES) => {
    switch (category) {
      case 'EMERGENCY': return <Shield size={16} />;
      case 'MEDICAL': return <Plus size={16} />;
      case 'SAFETY': return <Users size={16} />;
      case 'MENTAL_HEALTH': return <Brain size={16} />;
      case 'SPECIALIZED': return <Star size={16} />;
      case 'MULTILINGUAL': return <Globe size={16} />;
      default: return <Star size={16} />;
    }
  };

  const handleTemplateSelect = (template: VoiceTemplate) => {
    if (mergeMode) {
      if (templatesForMerge.includes(template.id)) {
        setTemplatesForMerge(prev => prev.filter(id => id !== template.id));
      } else {
        setTemplatesForMerge(prev => [...prev, template.id]);
      }
    } else {
      onSelectTemplate(template);
    }
  };

  const handleMergeTemplates = () => {
    if (templatesForMerge.length >= 2) {
      const mergedTemplate = mergeTemplates(templatesForMerge);
      onSelectTemplate(mergedTemplate);
      setTemplatesForMerge([]);
      setMergeMode(false);
    }
  };

  const handleCreateCustom = () => {
    if (!customName.trim() || !customKeywords.trim()) {
      alert('Please provide a name and keywords for the custom template');
      return;
    }

    const keywords = customKeywords.split(',').map(k => k.trim()).filter(k => k);
    const template = createCustomTemplate(
      customName,
      keywords,
      customLanguage,
      `Custom template created by user`
    );

    onCreateCustom(template);
    setCustomName('');
    setCustomKeywords('');
  };

  const isTemplateSelected = (templateId: string) => {
    return selectedTemplates.includes(templateId);
  };

  const isTemplateInMerge = (templateId: string) => {
    return templatesForMerge.includes(templateId);
  };

  return (
    <div className="voice-template-selector">
      <div className="template-header">
        <h3>🎯 Voice Session Templates</h3>
        <div className="merge-controls">
          <button 
            onClick={() => setMergeMode(!mergeMode)}
            className={`merge-btn ${mergeMode ? 'active' : ''}`}
          >
            {mergeMode ? 'Cancel Merge' : 'Merge Templates'}
          </button>
          {mergeMode && templatesForMerge.length >= 2 && (
            <button onClick={handleMergeTemplates} className="merge-create-btn">
              Create Merged ({templatesForMerge.length})
            </button>
          )}
        </div>
      </div>

      <div className="template-tabs">
        <button 
          onClick={() => setActiveTab('popular')}
          className={`tab ${activeTab === 'popular' ? 'active' : ''}`}
        >
          <Star size={16} />
          Popular
        </button>
        <button 
          onClick={() => setActiveTab('category')}
          className={`tab ${activeTab === 'category' ? 'active' : ''}`}
        >
          <Shield size={16} />
          Categories
        </button>
        <button 
          onClick={() => setActiveTab('custom')}
          className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
        >
          <Plus size={16} />
          Custom
        </button>
      </div>

      <div className="template-content">
        {activeTab === 'popular' && (
          <div className="popular-templates">
            <p className="section-description">Most commonly used emergency templates</p>
            <div className="template-grid">
              {getPopularTemplates().map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                  isSelected={isTemplateSelected(template.id)}
                  isInMerge={isTemplateInMerge(template.id)}
                  mergeMode={mergeMode}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'category' && (
          <div className="category-templates">
            <div className="category-selector">
              {Object.keys(TEMPLATE_CATEGORIES).map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as keyof typeof TEMPLATE_CATEGORIES)}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                >
                  {getCategoryIcon(category as keyof typeof TEMPLATE_CATEGORIES)}
                  {category.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="template-grid">
              {getTemplatesByCategory(selectedCategory).map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                  isSelected={isTemplateSelected(template.id)}
                  isInMerge={isTemplateInMerge(template.id)}
                  mergeMode={mergeMode}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="custom-template-creator">
            <h4>Create Custom Voice Template</h4>
            
            <div className="form-group">
              <label>Template Name:</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. My Emergency Template"
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Keywords (comma-separated):</label>
              <textarea
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                placeholder="help, emergency, danger, socorro, aide"
                className="custom-textarea"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Language:</label>
              <select 
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                className="custom-select"
              >
                <option value="en-US">English (US)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="it-IT">Italian</option>
                <option value="pt-PT">Portuguese</option>
                <option value="zh-CN">Chinese</option>
                <option value="ja-JP">Japanese</option>
                <option value="ko-KR">Korean</option>
                <option value="ru-RU">Russian</option>
              </select>
            </div>

            <button onClick={handleCreateCustom} className="create-custom-btn">
              <Plus size={16} />
              Create Custom Template
            </button>

            <div className="template-tips">
              <h5>💡 Template Tips:</h5>
              <ul>
                <li>Use clear, distinct emergency keywords</li>
                <li>Consider multiple languages if needed</li>
                <li>Include variations of the same concept</li>
                <li>Test keywords before emergency situations</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .voice-template-selector {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .template-header h3 {
          margin: 0;
          color: #333;
        }

        .merge-controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .merge-btn {
          padding: 6px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .merge-btn.active {
          background: #ff9800;
          color: white;
          border-color: #ff9800;
        }

        .merge-create-btn {
          padding: 6px 12px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }

        .template-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 20px;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          color: #666;
          font-size: 14px;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab.active {
          color: #2196F3;
          border-bottom-color: #2196F3;
        }

        .tab:hover {
          background: #f5f5f5;
        }

        .section-description {
          color: #666;
          margin: 0 0 15px 0;
          font-size: 14px;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 15px;
        }

        .category-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .category-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          text-transform: capitalize;
          transition: all 0.2s;
        }

        .category-btn.active {
          background: #2196F3;
          color: white;
          border-color: #2196F3;
        }

        .custom-template-creator h4 {
          margin: 0 0 20px 0;
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

        .custom-input, .custom-textarea, .custom-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .custom-input:focus, .custom-textarea:focus, .custom-select:focus {
          outline: none;
          border-color: #2196F3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
        }

        .create-custom-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .create-custom-btn:hover {
          background: #45a049;
        }

        .template-tips {
          background: #f0f8ff;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #2196F3;
        }

        .template-tips h5 {
          margin: 0 0 10px 0;
          color: #1976D2;
        }

        .template-tips ul {
          margin: 0;
          padding-left: 20px;
        }

        .template-tips li {
          margin-bottom: 5px;
          font-size: 13px;
          color: #555;
        }

        @media (max-width: 768px) {
          .template-header {
            flex-direction: column;
            align-items: stretch;
          }

          .template-tabs {
            overflow-x: auto;
          }

          .template-grid {
            grid-template-columns: 1fr;
          }

          .category-selector {
            overflow-x: auto;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

interface TemplateCardProps {
  template: VoiceTemplate;
  onSelect: (template: VoiceTemplate) => void;
  isSelected: boolean;
  isInMerge: boolean;
  mergeMode: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  isSelected,
  isInMerge,
  mergeMode
}) => {
  return (
    <div 
      className={`template-card ${isSelected ? 'selected' : ''} ${isInMerge ? 'in-merge' : ''} ${mergeMode ? 'merge-mode' : ''}`}
      onClick={() => onSelect(template)}
    >
      <div className="card-header">
        <div className="card-icon" style={{ backgroundColor: template.color }}>
          <span>{template.icon}</span>
        </div>
        <div className="card-info">
          <h4>{template.name}</h4>
          <p>{template.description}</p>
        </div>
        <div className="card-status">
          {isSelected && <Check size={16} className="check-icon" />}
          {isInMerge && <span className="merge-badge">M</span>}
        </div>
      </div>

      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">Language:</span>
          <span className="detail-value">{template.language}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Keywords:</span>
          <span className="detail-value">{template.keywords.length}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Confidence:</span>
          <span className="detail-value">{(template.confidenceThreshold * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="card-keywords">
        {template.keywords.slice(0, 6).map(keyword => (
          <span key={keyword} className="keyword-tag">{keyword}</span>
        ))}
        {template.keywords.length > 6 && (
          <span className="keyword-more">+{template.keywords.length - 6} more</span>
        )}
      </div>

      <style jsx>{`
        .template-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }

        .template-card:hover {
          border-color: #2196F3;
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
        }

        .template-card.selected {
          border-color: #4CAF50;
          background: #f8fff8;
        }

        .template-card.in-merge {
          border-color: #ff9800;
          background: #fff8f0;
        }

        .template-card.merge-mode {
          position: relative;
        }

        .template-card.merge-mode::before {
          content: 'Select to merge';
          position: absolute;
          top: -8px;
          left: 10px;
          background: #ff9800;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .card-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          flex-shrink: 0;
        }

        .card-info {
          flex-grow: 1;
          min-width: 0;
        }

        .card-info h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #333;
          font-weight: 600;
        }

        .card-info p {
          margin: 0;
          font-size: 12px;
          color: #666;
          line-height: 1.3;
        }

        .card-status {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .check-icon {
          color: #4CAF50;
        }

        .merge-badge {
          background: #ff9800;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }

        .card-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .detail-row {
          text-align: center;
        }

        .detail-label {
          display: block;
          font-size: 10px;
          color: #888;
          margin-bottom: 2px;
        }

        .detail-value {
          display: block;
          font-size: 12px;
          color: #333;
          font-weight: 500;
        }

        .card-keywords {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .keyword-tag {
          background: #f0f0f0;
          color: #555;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          border: 1px solid #e0e0e0;
        }

        .keyword-more {
          color: #888;
          font-size: 10px;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default VoiceTemplateSelector;