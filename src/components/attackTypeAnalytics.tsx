import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CyberIncident } from './Map.tsx';
import { X, Zap, TrendingUp } from 'lucide-react';

interface AttackTypeAnalyticsProps {
  incidents: CyberIncident[];
  onClose: () => void;
}

const AttackTypeAnalytics: React.FC<AttackTypeAnalyticsProps> = ({ incidents, onClose }) => {
  const attackTypeData = useMemo(() => {
    const attackTypeCount = incidents.reduce((acc, incident) => {
      acc[incident.attackType] = (acc[incident.attackType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(attackTypeCount)
      .map(([attackType, count]) => ({
        attackType,
        count,
        percentage: (count / incidents.length) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }, [incidents]);

  const getAttackTypeEmoji = (attackType: string): string => {
    const emojiMap: Record<string, string> = {
      'Malware': '🦠',
      'Phishing': '🎣',
      'DDoS': '💥',
      'Exploit': '⚡',
      'InsiderThreat': '👤',
      'Physical': '🔒',
      'SupplyChain': '🔗',
      'WebAttack': '🌐',
      'AccountCompromise': '🔑',
      'DataBreach': '📊',
      'Ransomware': '🔐'
    };
    return emojiMap[attackType] || '❗';
  };

  const getAttackTypeColor = (index: number) => {
    const colors = [
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500', 
      'bg-teal-500', 'bg-emerald-500', 'bg-lime-500', 'bg-amber-500'
    ];
    return colors[index % colors.length];
  };

  const getAttackTypeGlow = (index: number) => {
    const glows = [
      '#a855f7', '#ec4899', '#6366f1', '#06b6d4', 
      '#14b8a6', '#10b981', '#84cc16', '#f59e0b'
    ];
    return glows[index % glows.length];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] overflow-hidden bg-gray-900 border-gray-600">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Attack Type Analysis
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
            {/* Top 3 Attack Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {attackTypeData.slice(0, 3).map((data, index) => (
                <div 
                  key={data.attackType}
                  className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 text-center"
                >
                  <div className="text-3xl mb-2">{getAttackTypeEmoji(data.attackType)}</div>
                  <div className="text-lg font-bold text-white">{data.count}</div>
                  <div className="text-sm text-gray-400">{data.attackType}</div>
                  <div className="text-xs text-gray-500">{data.percentage.toFixed(1)}%</div>
                </div>
              ))}
            </div>

            {/* Complete Attack Type Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Complete Breakdown
              </h3>
              
              <div className="space-y-3">
                {attackTypeData.map((data, index) => (
                  <div key={data.attackType} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getAttackTypeEmoji(data.attackType)}</span>
                        <span className="text-white font-medium">{data.attackType}</span>
                      </div>
                      <span className="text-gray-400">
                        {data.count} attacks ({data.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ${getAttackTypeColor(index)}`}
                        style={{
                          width: `${data.percentage}%`,
                          boxShadow: `0 0 10px ${getAttackTypeGlow(index)}40`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Threat Assessment */}
            <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Threat Vector Assessment</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Most Common:</span>
                  <div className="text-white font-medium">
                    {getAttackTypeEmoji(attackTypeData[0]?.attackType)} {attackTypeData[0]?.attackType}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Attack Vectors:</span>
                  <div className="text-white font-medium">{attackTypeData.length} types</div>
                </div>
                <div>
                  <span className="text-gray-400">Diversity Index:</span>
                  <div className="text-white font-medium">
                    {((attackTypeData.length / 11) * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Top 3 Coverage:</span>
                  <div className="text-white font-medium">
                    {attackTypeData.slice(0, 3).reduce((sum, item) => sum + item.percentage, 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Recommendations */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">Security Recommendations</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Focus defenses on {attackTypeData[0]?.attackType} protection</li>
                <li>• Implement multi-layered security for top 3 attack vectors</li>
                <li>• Regular training for {attackTypeData.filter(d => ['Phishing', 'InsiderThreat'].includes(d.attackType)).length > 0 ? 'social engineering' : 'technical'} attacks</li>
                <li>• Monitor emerging threat patterns continuously</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttackTypeAnalytics;
