// src/pages/NewsPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { FaNewspaper, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';
import API from '../api';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FFFBEB',
    padding: '32px 16px',
  },
  maxWidthContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  headerBanner: {
    background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 60%, #E8920C 100%)',
    borderRadius: '16px',
    padding: '36px 24px',
    marginBottom: '28px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(13, 148, 136, 0.2)',
  },
  headerBannerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(ellipse at top right, rgba(245,158,11,0.25) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '10px',
  },
  headerIcon: {
    fontSize: '40px',
    color: 'rgba(255,255,255,0.9)',
  },
  headerTitle: {
    fontSize: '34px',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    margin: 0,
    fontSize: '15px',
    fontWeight: '400',
  },
  categoryContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  categoryButton: {
    padding: '8px 22px',
    borderRadius: '50px',
    fontWeight: '600',
    fontSize: '13px',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.25s',
    letterSpacing: '0.01em',
  },
  categoryButtonActive: {
    background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.35)',
    borderColor: 'transparent',
  },
  categoryButtonInactive: {
    backgroundColor: 'white',
    color: '#374151',
    borderColor: '#E5E7EB',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '80px 0',
  },
  spinnerIcon: {
    fontSize: '48px',
    color: '#0D9488',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    border: '1px solid #f87171',
    color: '#991b1b',
    padding: '24px',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '32px',
  },
  newsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: '24px',
  },
  newsCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.07)',
    overflow: 'hidden',
    transition: 'all 0.3s',
    display: 'flex',
    flexDirection: 'row',
    height: '220px',
    borderLeft: '4px solid #0D9488',
  },
  newsImage: {
    width: '33.333%',
    height: '100%',
    objectFit: 'cover',
    flexShrink: 0,
  },
  newsImagePlaceholder: {
    width: '33.333%',
    height: '100%',
    background: 'linear-gradient(to bottom right, #0D9488, #E8920C)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  placeholderIcon: {
    fontSize: '60px',
    color: 'white',
    opacity: 0.5,
  },
  cardContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    width: '66.667%',
    overflow: 'hidden',
  },
  sourceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '12px',
    color: '#6b7280',
  },
  sourceName: {
    fontWeight: '700',
    color: '#0D9488',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.4',
  },
  cardDescription: {
    color: '#6b7280',
    fontSize: '13px',
    marginBottom: '12px',
    flexGrow: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.5',
  },
  readMoreLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#0D9488',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'color 0.2s',
    fontSize: '13px',
    borderBottom: '2px solid #5EEAD4',
    paddingBottom: '1px',
  },
  noNewsContainer: {
    textAlign: 'center',
    padding: '80px 0',
    color: '#6b7280',
  },
  noNewsIcon: {
    fontSize: '60px',
    margin: '0 auto 16px',
    opacity: 0.3,
  },
  noNewsText: {
    fontSize: '20px',
    margin: 0,
  },
};

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('general');

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get(`/news/${category}`);
      setNews(response.data.articles || []);
      setLoading(false);
    } catch (error) {
      setError('Failed to load news. Please try again later.');
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const categories = [
    { value: 'technology', label: 'Tech Jobs' },
    { value: 'business', label: 'Industry Trends' },
    { value: 'general', label: 'Career Development' },
    { value: 'health', label: 'Healthcare Careers' },
    { value: 'science', label: 'Research & Innovation' },
  ];

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .news-card:hover {
            box-shadow: 0 12px 30px rgba(13, 148, 136, 0.15);
            transform: translateY(-3px);
            border-left-color: #E8920C;
          }
          .category-btn-inactive:hover {
            background-color: #CCFBF1;
            border-color: #0D9488 !important;
            color: #0D9488;
          }
          .read-more-link:hover {
            color: #E8920C;
            border-bottom-color: #E8920C;
          }
          @media (min-width: 768px) {
            .news-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (min-width: 1024px) {
            .news-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.maxWidthContainer}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerBanner}>
              <div style={styles.headerBannerOverlay} />
              <div style={styles.headerContent}>
                <FaNewspaper style={styles.headerIcon} />
                <h1 style={styles.headerTitle}>Career Insights</h1>
              </div>
              <p style={styles.headerSubtitle}>Stay ahead — job market trends, industry shifts, and career growth stories</p>
            </div>
          </div>

          {/* Category Filter */}
          <div style={styles.categoryContainer}>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  ...styles.categoryButton,
                  ...(category === cat.value
                    ? styles.categoryButtonActive
                    : styles.categoryButtonInactive),
                }}
                className={category === cat.value ? '' : 'category-btn-inactive'}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={styles.loadingContainer}>
              <FaSpinner style={styles.spinnerIcon} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={styles.errorContainer}>
              {error}
            </div>
          )}

          {/* News Grid */}
          {!loading && !error && news.length > 0 && (
            <div style={styles.newsGrid} className="news-grid">
              {news.map((article, index) => (
                <div
                  key={index}
                  style={styles.newsCard}
                  className="news-card"
                >
                  {/* Content */}
                  <div style={styles.cardContent}>
                    {/* Source & Date */}
                    <div style={styles.sourceRow}>
                      <span style={styles.sourceName}>
                        {article.source.name}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={styles.cardTitle}>
                      {article.title}
                    </h3>

                    {/* Description */}
                    <p style={styles.cardDescription}>
                      {article.description || "No description available."}
                    </p>

                    {/* Read More Button */}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.readMoreLink}
                      className="read-more-link"
                    >
                      Read More
                      <FaExternalLinkAlt style={{ fontSize: '12px' }} />
                    </a>
                  </div>

                  {/* Image */}
                  {article.urlToImage ? (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      style={styles.newsImage}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x200?text=No+Image";
                      }}
                    />
                  ) : (
                    <div style={styles.newsImagePlaceholder}>
                      <FaNewspaper style={styles.placeholderIcon} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No News */}
          {!loading && !error && news.length === 0 && (
            <div style={styles.noNewsContainer}>
              <FaNewspaper style={styles.noNewsIcon} />
              <p style={styles.noNewsText}>No news available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NewsPage;
