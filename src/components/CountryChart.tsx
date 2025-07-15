import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CyberIncident } from './Map';

interface CountryThreatChartProps {
  incidents: CyberIncident[];
}

interface CountryThreatData {
  country: string;
  count: number;
  percentage: number;
}

const CountryThreatChart: React.FC<CountryThreatChartProps> = ({ incidents }) => {
  const countryData = useMemo(() => {
    // Count incidents by country
    const countryCount = incidents.reduce((acc, incident) => {
      const country = incident.location.country;
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by count (descending)
    const sortedCountries = Object.entries(countryCount)
      .map(([country, count]) => ({
        country,
        count,
        percentage: (count / incidents.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Show top 8 countries

    return sortedCountries;
  }, [incidents]);

  const maxCount = countryData[0]?.count || 1;

  const getBarColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.8) return 'bg-red-600';
    if (intensity > 0.6) return 'bg-orange-600';
    if (intensity > 0.4) return 'bg-yellow-600';
    if (intensity > 0.2) return 'bg-blue-600';
    return 'bg-green-600';
  };

  const getBarGlow = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.8) return 'shadow-red-500/50';
    if (intensity > 0.6) return 'shadow-orange-500/50';
    if (intensity > 0.4) return 'shadow-yellow-500/50';
    if (intensity > 0.2) return 'shadow-blue-500/50';
    return 'shadow-green-500/50';
  };

  return (
    <Card className="w-80 cyber-shadow z-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm gradient-text">Top Threat Countries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
          {countryData.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              No threat data available
            </div>
          ) : (
            countryData.map((data, index) => (
              <div key={data.country} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-white">
                    #{index + 1} {data.country}
                  </span>
                  <span className="text-muted-foreground">
                    {data.count} ({data.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(data.count)} ${getBarGlow(data.count)} shadow-lg`}
                      style={{
                        width: `${(data.count / maxCount) * 100}%`,
                        boxShadow: `0 0 10px ${getBarColor(data.count).includes('red') ? '#dc2626' : 
                          getBarColor(data.count).includes('orange') ? '#ea580c' :
                          getBarColor(data.count).includes('yellow') ? '#ca8a04' :
                          getBarColor(data.count).includes('blue') ? '#2563eb' : '#16a34a'}40`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 pt-3 border-t border-gray-600">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-white">{countryData.length}</div>
              <div className="text-muted-foreground">Countries</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">{incidents.length}</div>
              <div className="text-muted-foreground">Total Threats</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 pt-2 border-t border-gray-600">
          <div className="text-xs text-muted-foreground mb-2">Threat Level:</div>
          <div className="grid grid-cols-5 gap-1 text-xs">
            <div className="flex flex-col items-center">
              <div className="w-3 h-2 bg-red-600 rounded mb-1"></div>
              <span className="text-red-400">Very High</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-2 bg-orange-600 rounded mb-1"></div>
              <span className="text-orange-400">High</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-2 bg-yellow-600 rounded mb-1"></div>
              <span className="text-yellow-400">Medium</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-2 bg-blue-600 rounded mb-1"></div>
              <span className="text-blue-400">Low</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-2 bg-green-600 rounded mb-1"></div>
              <span className="text-green-400">Very Low</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountryThreatChart;
