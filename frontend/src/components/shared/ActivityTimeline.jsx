import { useState } from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';

const CHANNEL_COLORS = {
  EMAIL: 'bg-channel-email',
  SMS: 'bg-channel-sms',
  WHATSAPP: 'bg-channel-whatsapp',
};

const CHANNEL_TEXT = {
  EMAIL: 'bg-blue-100 text-blue-700',
  SMS: 'bg-green-100 text-green-700',
  WHATSAPP: 'bg-purple-100 text-purple-700',
};

export function ActivityTimeline({ activities = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  if (activities.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4">No activity recorded yet.</p>
    );
  }

  return (
    <div className="relative">
      {activities.map((activity, index) => {
        const isLast = index === activities.length - 1;
        const isExpanded = expandedId === activity.id;
        const date = activity.dateAdded || activity.activityTime;

        return (
          <div key={activity.id} className="relative flex gap-4 pb-6">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-200" />
            )}

            {/* Dot */}
            <div
              className={clsx(
                'relative z-10 mt-1 w-[15px] h-[15px] rounded-full border-2 border-white shrink-0',
                CHANNEL_COLORS[activity.templateType] || 'bg-slate-400'
              )}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header row */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {date && (
                  <span className="text-xs text-slate-400">
                    {format(new Date(date), 'MMM d, yyyy h:mm a')}
                  </span>
                )}
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    CHANNEL_TEXT[activity.templateType] || 'bg-gray-100 text-gray-500'
                  )}
                >
                  {activity.templateType}
                </span>
                {activity.aiGenerated && (
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                    AI
                  </span>
                )}
              </div>

              {/* Description */}
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : activity.id)
                }
                className="text-sm text-slate-700 text-left hover:text-primary transition-colors"
              >
                {activity.description}
              </button>

              {/* Expanded content */}
              {isExpanded && activity.contentSent && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                  {activity.templateType === 'EMAIL' ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: activity.contentSent }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{activity.contentSent}</p>
                  )}
                </div>
              )}

              {/* User */}
              {activity.user && (
                <p className="text-xs text-slate-400 mt-1">
                  by {activity.user}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
