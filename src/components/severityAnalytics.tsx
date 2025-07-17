import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CyberIncident } from './Map.tsx';
import { X, Shield, AlertTriangle } from 'lucide-react';

interface SeverityAnalyticsProps {
  incidents: CyberIncident[];
  onClose: () => void;
}

const SeverityAnalytics: React.FC<SeverityAnalyticsProps> = ({ incidents, onClose }) => {
  const severityData = useMemo(() => {
    const severityCount = incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityOrder = ['critical', 'high', 'medium', 'low'];
    
    return severityOrder.map(severity => ({
      severity,
      count: severityCount[severity] || 0,
      percentage: ((severityCount[severity] || 0) / incidents.length) * 100
    }));
  }, [incidents]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' };
      case 'high': return { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500' };
      case 'medium': return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' };
      case 'low': return { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-400', border: 'border-gray-500' };
    }
  };

  const totalThreats = incidents.length;
  const criticalThreats = severityData.find(s => s.severity === 'critical')?.count || 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-600">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            Severity Analysis Dashboard
          </CardTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">Critical Risk</span>
                </div>
                <div className="text-2xl font-bold text-white">{criticalThreats}</div>
                <div className="text-sm text-gray-400">
                  {((criticalThreats / totalThreats) * 100).toFixed(1)}% of total
                </div>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Total Threats</span>
                </div>
                <div className="text-2xl font-bold text-white">{totalThreats}</div>
                <div className="text-sm text-gray-400">Active incidents</div>
              </div>
            </div>

            {/* Severity Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Severity Breakdown</h3>
              {severityData.map((data) => {
                const colors = getSeverityColor(data.severity);
                return (
                  <div key={data.severity} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${colors.bg}`}></div>
                        <span className="text-white capitalize font-medium">{data.severity}</span>
                      </div>
                      <span className="text-gray-400">
                        {data.count} ({data.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all duration-1000 ${colors.bg}`}
                        style={{
                          width: `${data.percentage}%`,
                          boxShadow: `0 0 10px ${colors.bg.includes('red') ? '#ef4444' : 
                            colors.bg.includes('orange') ? '#f97316' :
                            colors.bg.includes('yellow') ? '#eab308' : '#22c55e'}40`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Risk Assessment */}
            <div className={`p-4 rounded-lg border ${
              criticalThreats > 0 ? 'bg-red-900/20 border-red-500/30' : 'bg-green-900/20 border-green-500/30'
            }`}>
              <h4 className={`font-semibold mb-2 ${criticalThreats > 0 ? 'text-red-400' : 'text-green-400'}`}>
                Risk Assessment
              </h4>
              <p className="text-gray-300 text-sm">
                {criticalThreats > 0 
                  ? `High risk detected: ${criticalThreats} critical threat(s) require immediate attention.`
                  : 'Risk level manageable: No critical threats detected.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeverityAnalytics;
