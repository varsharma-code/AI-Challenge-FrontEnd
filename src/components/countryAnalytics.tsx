import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CyberIncident } from './Map.tsx';
import { X, Globe, TrendingUp } from 'lucide-react';

interface CountryAnalyticsProps {
  incidents: CyberIncident[];
  onClose: () => void;
}

const CountryAnalytics: React.FC<CountryAnalyticsProps> = ({ incidents, onClose }) => {
  const countryData = useMemo(() => {
    const countryCount = incidents.reduce((acc, incident) => {
      const country = incident.location.country;
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countryCount)
      .map(([country, count]) => ({
        country,
        count,
        percentage: (count / incidents.length) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }, [incidents]);

  const maxCount = countryData[0]?.count || 1;

  const getBarColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.8) return 'bg-red-500';
    if (intensity > 0.6) return 'bg-orange-500';
    if (intensity > 0.4) return 'bg-yellow-500';
    if (intensity > 0.2) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden bg-gray-900 border-gray-600">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Country Threat Analysis
          </CardTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{countryData.length}</div>
                <div className="text-sm text-gray-400">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{incidents.length}</div>
                <div className="text-sm text-gray-400">Total Threats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{countryData[0]?.count || 0}</div>
                <div className="text-sm text-gray-400">Highest Count</div>
              </div>
            </div>

            <div className="space-y-3">
              {countryData.map((data, index) => (
                <div key={data.country} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">
                      #{index + 1} {data.country}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {data.count} threats ({data.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getBarColor(data.count)}`}
                      style={{
                        width: `${(data.count / maxCount) * 100}%`,
                        boxShadow: `0 0 8px ${getBarColor(data.count).includes('red') ? '#ef4444' : 
                          getBarColor(data.count).includes('orange') ? '#f97316' :
                          getBarColor(data.count).includes('yellow') ? '#eab308' :
                          getBarColor(data.count).includes('blue') ? '#3b82f6' : '#22c55e'}40`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CountryAnalytics;
