import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { RefreshCw, Sparkles, ChevronRight } from 'lucide-react';
import RecommendationCard from './RecommendationCard';
import { getProgramRecommendations } from '../../services/matchingService';
import { useAuth } from '../../context/AuthContext';

const RecommendationsWidget = ({ compact = false, autoRefreshInterval = 0 }) => {
  const { user } = useAuth();
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefreshInterval > 0);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-program-recommendations', user?.id],
    queryFn: async () => {
      const res = await getProgramRecommendations({ page: '1', limit: '5' });
      if (res.success) return res.data;
      return { recommendations: [], pagination: { total: 0 } };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!autoRefreshEnabled || autoRefreshInterval <= 0) return;
    const timer = setInterval(() => {
      refetch();
    }, autoRefreshInterval * 1000);
    return () => clearInterval(timer);
  }, [autoRefreshEnabled, autoRefreshInterval, refetch]);

  const recommendations = data?.recommendations || [];

  if (compact) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem 1.5rem', border: '1px solid #F0EDE8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: 'var(--color-heading)', fontWeight: 700, margin: 0 }}>
            Top Recommendations
          </h3>
          <Link to="/matching/programs" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
            View All <ChevronRight size={14} />
          </Link>
        </div>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '18px', width: '100%', borderRadius: '4px' }} />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-body)', margin: 0 }}>No recommendations available yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {recommendations.slice(0, 3).map((rec) => (
              <Link
                key={rec.programId}
                to={`/matching/programs?highlight=${rec.programId}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid #F0EDE8', textDecoration: 'none', background: '#FDFBF7', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.borderColor = '#D1FAE5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FDFBF7'; e.currentTarget.style.borderColor = '#F0EDE8'; }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-heading)', margin: '0 0 0.15rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rec.programTitle}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-body)', margin: 0, lineHeight: 1.4 }}>
                    {rec.reasonForRecommendation?.split('; ')[0] || 'General match'}
                  </p>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', marginLeft: '0.75rem', flexShrink: 0 }}>
                  {rec.score}%
                </span>
              </Link>
            ))}
          </div>
        )}
        <div style={{ marginTop: '0.875rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => refetch()}
            style={{ padding: '0.35rem 0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'white', color: 'var(--color-heading)', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #F0EDE8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Sparkles size={18} color="var(--primary-blue)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: 'var(--color-heading)', fontWeight: 700, margin: 0 }}>
            Recommended for You
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
           {autoRefreshInterval > 0 && (
             <button
               onClick={() => setAutoRefreshEnabled((prev) => !prev)}
               style={{
                 padding: '0.35rem 0.625rem',
                 borderRadius: 'var(--radius-md)',
                 border: '1px solid var(--color-border)',
                 background: autoRefreshEnabled ? '#DCFCE7' : 'white',
                 color: autoRefreshEnabled ? '#059669' : 'var(--color-heading)',
                 fontWeight: 600,
                 cursor: 'pointer',
                 fontSize: '0.75rem',
                 display: 'inline-flex',
                 alignItems: 'center',
                 gap: '0.25rem',
               }}
             >
               <RefreshCw size={12} /> Auto
             </button>
           )}
          <button onClick={() => refetch()} style={{ padding: '0.35rem 0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'white', color: 'var(--color-heading)', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <RefreshCw size={12} /> Refresh
          </button>
          <Link to="/matching/programs" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
            View All <ChevronRight size={14} />
          </Link>
        </div>
      </div>
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '18px', width: '100%', borderRadius: '4px' }} />
          ))}
        </div>
      )}
      {isError && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: 0 }}>Could not load recommendations.</p>
      )}
      {!isLoading && !isError && recommendations.length === 0 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-body)', margin: 0 }}>No recommendations available yet.</p>
      )}
      {!isLoading && !isError && recommendations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {recommendations.slice(0, 3).map((rec) => (
          <RecommendationCard
            key={rec.programId}
            recommendation={{
              id: rec.programId,
              title: rec.programTitle,
              description: rec.reasonForRecommendation,
              reason: rec.reasonForRecommendation,
              priority: rec.priority || 'Medium',
              score: rec.score,
            }}
            onSavedChange={(id, saved) => {
              refetch();
            }}
            onDismissed={(id) => {
              refetch();
            }}
          />
        ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsWidget;
