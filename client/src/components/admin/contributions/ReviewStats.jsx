import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Edit3, Star, Timer } from 'lucide-react';

const ReviewStats = ({ stats = {} }) => {
  const items = [
    { label: 'Pending Reviews', value: stats.pending ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100/50' },
    { label: 'Under Review', value: stats.underReview ?? 0, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100/50' },
    { label: 'Approved', value: stats.approvedToday ?? 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
    { label: 'Rejected', value: stats.rejectedToday ?? 0, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100/50' },
    { label: 'Needs Changes', value: stats.needsChanges ?? 0, icon: Edit3, color: 'text-orange-600', bg: 'bg-orange-100/50' },
    { label: 'Featured', value: stats.featured ?? 0, icon: Star, color: 'text-purple-600', bg: 'bg-purple-100/50' },
    { label: 'Avg Time', value: stats.avgReviewTime ?? '0h', icon: Timer, color: 'text-indigo-600', bg: 'bg-indigo-100/50' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', height: '120px' }}
        >
          <div className={`p-4 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
            <item.icon size={26} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="text-3xl font-bold text-slate-800 leading-tight truncate">
              {item.value}
            </div>
            <div className="text-sm font-medium text-slate-500 truncate">
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewStats;
