import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = false }) => {
  const navigate = useNavigate();

  return (
    <header className="header gradient-bg">
      <div className="header-inner">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="header-back-btn"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="header-title">{title}</h1>
        {showBack && <div className="header-back-placeholder" />}
      </div>
    </header>
  );
};

export default Header;