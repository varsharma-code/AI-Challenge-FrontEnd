import React from 'react';
import { Shield, Activity, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg cyber-glow">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">CyberThreat Monitor</h1>
              <p className="text-sm text-muted-foreground">Global Cybersecurity Incident Visualization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Live Monitoring</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Global Coverage</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};