import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CyberIncident } from './Map.tsx';
import { X, Clock, Calendar, Activity } from 'lucide-react';

interface TimelineAnalyticsProps {
  incidents: CyberIncident[];
  onClose: () => void;
}

const TimelineAnalytics: React.FC<TimelineAnalyticsProps> = ({ incidents, onClose }) => {
  const timelineData = useMemo(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Hourly distribution for last 24 hours
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const count = incidents.filter(incident => {
        const incidentTime = new Date(incident.timestamp);
        return incidentTime >= last24h && incidentTime.getHours() === hour;
      }).length;
      return { hour, count, label: `${hour}:00` };
    });

    // Daily distribution for last 7 days
    const dailyData = Array.from({ length: 7 }, (_, dayOffset) => {
      const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const count = incidents.filter(incident => {
        const incidentDate = new Date(incident.timestamp);
        return incidentDate.toDateString() === date.toDateString();
      }).length;
      return { 
        date: date.toLocaleDateString('en-US', { weekday: 'short' }), 
        count,
        fullDate: date.toLocaleDateString()
      };
    }).reverse();

    // Recent incidents (last 24h)
    const recentIncidents = incidents
      .filter(incident => new Date(incident.timestamp) >= last24h)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    const stats = {
      last24h: incidents.filter(i => new Date(i.timestamp) >= last24h).length,
      last7d: incidents.filter(i => new Date(i.timestamp) >= last7d).length,
      last30d: incidents.filter(i => new Date(i.timestamp) >= last30d).length,
      peakHour: hourlyData.reduce((max, curr) => curr.count > max.count ? curr : max, hourlyData[0]),
    };

    return { hourlyData, dailyData, recentIncidents, stats };
  }, [incidents]);

  const maxHourlyCount = Math.max(...timelineData.hourlyData.map(d => d.count));
  const maxDailyCount = Math.max(...timelineData.dailyData.map(d => d.count));

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden bg-gray-900 border-gray-600">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Timeline Analysis
          </CardTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Time-based Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">{timelineData.stats.last24h}</div>
                <div className="text-sm text-blue-400">Last 24 Hours</div>
              </div>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">{timelineData.stats.last7d}</div>
                <div className="text-sm text-green-400">Last 7 Days</div>
              </div>
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">{timelineData.stats.last30d}</div>
                <div className="text-sm text-purple-400">Last 30 Days</div>
              </div>
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">{timelineData.stats.peakHour.hour}:00</div>
                <div className="text-sm text-orange-400">Peak Hour</div>
              </div>
            </div>

            {/* Hourly Distribution
                        {/* Hourly Distribution */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                24-Hour Activity Pattern
              </h3>
              <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4">
                <div className="flex items-end justify-between h-32 gap-1">
                  {timelineData.hourlyData.map((data) => (
                    <div key={data.hour} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-400"
                        style={{
                          height: `${maxHourlyCount > 0 ? (data.count / maxHourlyCount) * 100 : 0}%`,
                          minHeight: data.count > 0 ? '4px' : '0px',
                          boxShadow: data.count > 0 ? '0 0 8px #3b82f640' : 'none'
                        }}
                        title={`${data.label}: ${data.count} threats`}
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        {data.hour % 4 === 0 ? data.hour : ''}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:59</span>
                </div>
              </div>
            </div>

            {/* Daily Distribution */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                7-Day Trend
              </h3>
              <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4">
                <div className="flex items-end justify-between h-24 gap-2">
                  {timelineData.dailyData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-green-500 rounded-t transition-all duration-500 hover:bg-green-400"
                        style={{
                          height: `${maxDailyCount > 0 ? (data.count / maxDailyCount) * 100 : 0}%`,
                          minHeight: data.count > 0 ? '4px' : '0px',
                          boxShadow: data.count > 0 ? '0 0 8px #22c55e40' : 'none'
                        }}
                        title={`${data.fullDate}: ${data.count} threats`}
                      />
                      <div className="text-xs text-gray-400 mt-1">{data.date}</div>
                      <div className="text-xs text-gray-500">{data.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Incidents Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Recent Incidents (Last 24h)</h3>
              <div className="space-y-3">
                {timelineData.recentIncidents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No incidents in the last 24 hours</p>
                  </div>
                ) : (
                  timelineData.recentIncidents.map((incident) => (
                    <div 
                      key={incident.id} 
                      className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span 
                              className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}
                            >
                              {incident.severity.toUpperCase()}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {incident.location.country}
                            </span>
                          </div>
                          <h4 className="text-white font-medium mb-1">{incident.title}</h4>
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {incident.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Attack: {incident.attackType}</span>
                            <span>Source: {incident.source}</span>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-gray-400">{getTimeAgo(incident.timestamp)}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(incident.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pattern Analysis */}
            <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Pattern Analysis</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Most Active Hour:</span>
                  <div className="text-white font-medium">
                    {timelineData.stats.peakHour.hour}:00 ({timelineData.stats.peakHour.count} incidents)
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Activity Trend:</span>
                  <div className="text-white font-medium">
                    {timelineData.stats.last24h > timelineData.stats.last7d / 7 ? '📈 Increasing' : '📉 Decreasing'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Daily Average:</span>
                  <div className="text-white font-medium">
                    {(timelineData.stats.last7d / 7).toFixed(1)} incidents/day
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Weekly Growth:</span>
                  <div className="text-white font-medium">
                    {timelineData.stats.last7d > 0 ? 
                      `${((timelineData.stats.last24h * 7 / timelineData.stats.last7d - 1) * 100).toFixed(1)}%` : 
                      'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimelineAnalytics;

