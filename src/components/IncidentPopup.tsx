import React from 'react';
import { X, Shield, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CyberIncident } from './Map';

interface IncidentPopupProps {
  incident: CyberIncident;
  onClose: () => void;
}

export const IncidentPopup: React.FC<IncidentPopupProps> = ({ incident, onClose }) => {
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      case 'low': return <Shield className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg cyber-shadow max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant={getSeverityVariant(incident.severity)} className="flex items-center gap-1">
                {getSeverityIcon(incident.severity)}
                {incident.severity.toUpperCase()}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">{incident.title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{incident.location.city}, {incident.location.country}</span>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{formatTimestamp(incident.timestamp)}</span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {incident.description}
            </p>
          </div>

          {/* Attack Type */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Attack Type</h4>
            <Badge variant="outline">{incident.attackType}</Badge>
          </div>

          {/* Affected Systems */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Affected Systems</h4>
            <div className="flex flex-wrap gap-1">
              {incident.affectedSystems.map((system, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {system}
                </Badge>
              ))}
            </div>
          </div>

          {/* Source */}
          {incident.source && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Source</h4>
              <p className="text-sm text-muted-foreground">{incident.source}</p>
            </div>
          )}

          {/* Coordinates for reference */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Coordinates: {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};