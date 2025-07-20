import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ExternalLink, TrendingUp, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import './News.css';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  location: string;
  category: 'redzone' | 'safety' | 'policy' | 'community';
  priority: 'high' | 'medium' | 'low';
  imageUrl?: string;
}

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'redzone' | 'safety' | 'policy' | 'community'>('all');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNews([
        {
          id: '1',
          title: 'New Red Zone Identified in Downtown Area',
          summary: 'Crime statistics show increased incidents in the downtown commercial district',
          content: 'Based on recent crime data analysis, the downtown commercial district has been classified as a new red zone due to a 40% increase in theft and vandalism incidents over the past month.',
          date: '2024-01-15',
          location: 'Downtown Commercial District',
          category: 'redzone',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Enhanced Street Lighting Initiative Launched',
          summary: 'City council approves budget for improved lighting in high-crime areas',
          content: 'The city has allocated $2.5 million for enhanced LED street lighting in identified red zones to improve visibility and deter criminal activity during nighttime hours.',
          date: '2024-01-14',
          location: 'Citywide',
          category: 'safety',
          priority: 'medium'
        },
        {
          id: '3',
          title: 'Community Safety Workshop This Weekend',
          summary: 'Free self-defense and safety awareness classes for residents',
          content: 'Join us for a comprehensive safety workshop covering personal protection, situational awareness, and emergency response techniques. Open to all community members.',
          date: '2024-01-13',
          location: 'Community Center',
          category: 'community',
          priority: 'medium'
        },
        {
          id: '4',
          title: 'New Emergency Response Protocol Implemented',
          summary: 'Faster response times expected with updated dispatch system',
          content: 'The police department has implemented a new AI-powered dispatch system that reduces average emergency response times by 25% in red zone areas.',
          date: '2024-01-12',
          location: 'Citywide',
          category: 'policy',
          priority: 'high'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'redzone': return 'bg-red-100 text-red-800';
      case 'safety': return 'bg-green-100 text-green-800';
      case 'policy': return 'bg-blue-100 text-blue-800';
      case 'community': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <TrendingUp className="text-red-500" size={16} />;
      case 'medium': return <AlertCircle className="text-yellow-500" size={16} />;
      case 'low': return <AlertCircle className="text-green-500" size={16} />;
      default: return null;
    }
  };

  const filteredNews = news.filter(item => 
    filter === 'all' || item.category === filter
  );

  if (loading) {
    return (
      <div className="news-page">
        <Header title="Daily News" showBack />
        <div className="news-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <Header title="Daily News" />
      {/* Filter Tabs */}
      <div className="news-filter-tabs">
        {['all', 'redzone', 'safety', 'policy', 'community'].map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category as any)}
            className={`news-filter-btn${filter === category ? ' news-filter-btn-active' : ''}`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      {/* Breaking News Banner */}
      <div className="news-banner">
        <div className="news-banner-icon">
          <TrendingUp size={20} />
        </div>
        <div className="news-banner-content">
          <h3>BREAKING NEWS</h3>
          <p>New safety measures implemented citywide</p>
        </div>
      </div>
      {/* News List */}
      <div className="news-list">
        {filteredNews.length === 0 ? (
          <div className="news-card news-card-empty">
            <div className="news-empty-icon">📰</div>
            <h3 className="news-title">No News Found</h3>
            <p className="news-summary">No news articles match your current filter.</p>
          </div>
        ) : (
          filteredNews.map((item) => (
            <div key={item.id} className="news-card">
              <div className="news-card-header">
                <span className={`news-category news-category-${item.category}`}>{item.category.toUpperCase()}</span>
                {getPriorityIcon(item.priority)}
              </div>
              <h4 className="news-title">{item.title}</h4>
              <p className="news-summary">{item.summary}</p>
              <div className="news-meta">
                <div className="news-meta-item"><MapPin size={16} /> {item.location}</div>
                <div className="news-meta-item"><Calendar size={16} /> {item.date}</div>
              </div>
              <div className="news-divider"></div>
              <button className="news-read-btn">
                <ExternalLink size={16} />
                <span>Read Full Article</span>
              </button>
            </div>
          ))
        )}
      </div>
      {/* News Statistics */}
      <div className="news-stats">
        <h3 className="news-stats-title">News Summary</h3>
        <div className="news-stats-grid">
          <div className="news-stats-item">
            <div className="news-stats-value news-stats-red">{news.filter(n => n.category === 'redzone').length}</div>
            <div className="news-stats-label">Red Zone Updates</div>
          </div>
          <div className="news-stats-item">
            <div className="news-stats-value news-stats-green">{news.filter(n => n.category === 'safety').length}</div>
            <div className="news-stats-label">Safety Initiatives</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;