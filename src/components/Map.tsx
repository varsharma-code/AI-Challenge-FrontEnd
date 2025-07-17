import React, { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IncidentPopup } from './IncidentPopup';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Threat, Severity, AttackType } from '@/types/threats'; // Import Severity and AttackType
import { useThreats } from '@/hooks/useThreats';
import CountryThreatChart from './CountryChart.tsx';

import CountryAnalytics from './countryAnalytics.tsx';
import SeverityAnalytics from './severityAnalytics.tsx';
import AttackTypeAnalytics from './attackTypeAnalytics.tsx';
import TimelineAnalytics from './timelineAnalytics.tsx';
import { BarChart3, Shield, Zap, Clock } from 'lucide-react';
// Assuming these types are correctly imported from '@/types/threats'
// If not, you might need to hardcode them here or adjust the import path.
const SEVERITY_OPTIONS: Severity[] = ['low', 'medium', 'high', 'critical'];
const ATTACK_TYPE_OPTIONS: AttackType[] = [
  'Malware', 'Phishing', 'DDoS', 'Exploit', 'InsiderThreat', 'Physical',
  'SupplyChain', 'WebAttack', 'AccountCompromise', 'DataBreach', 'Ransomware'
];

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Ensure CyberIncident matches the Threat interface for seamless conversion
export interface CyberIncident {
  id: string;
  title: string;
  description: string;
  severity: Severity; // Use imported Severity type
  location: {
    lat: number;
    lng: number;
    country: string;
    city: string;
  };
  timestamp: string;
  affectedSystems: string[];
  attackType: AttackType; // Use imported AttackType type
  source: string; // Source is required in Threat interface
}

// Sample data structure for demonstration (updated to match CyberIncident interface)
const sampleIncidents: CyberIncident[] = [
  {
    id: '1',
    title: 'Advanced Persistent Threat Detected',
    description: 'Sophisticated APT group targeting critical infrastructure with zero-day exploits.',
    severity: 'critical',
    location: { lat: 40.7128, lng: -74.0060, country: 'USA', city: 'New York' },
    timestamp: new Date().toISOString(),
    affectedSystems: ['Industrial Control Systems', 'Financial Networks'],
    attackType: 'Exploit', // Changed to match AttackType enum
    source: 'Government Alert'
  },
  {
    id: '2',
    title: 'Ransomware Campaign Spreading',
    description: 'New ransomware variant affecting healthcare institutions across the region.',
    severity: 'high',
    location: { lat: 51.5074, lng: -0.1278, country: 'UK', city: 'London' },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    affectedSystems: ['Hospital Networks', 'Patient Records'],
    attackType: 'Ransomware',
    source: 'Security Vendor'
  },
  {
    id: '3',
    title: 'Data Breach at Financial Institution',
    description: 'Unauthorized access to customer databases detected and contained.',
    severity: 'medium',
    location: { lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo' },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    affectedSystems: ['Customer Database', 'Transaction Systems'],
    attackType: 'DataBreach', // Changed to match AttackType enum
    source: 'Internal Security'
  }
];

// Conversion function from backend Threat to frontend CyberIncident
const convertThreatToIncident = (threat: Threat): CyberIncident => {
  return {
    id: threat.id,
    title: threat.title,
    description: threat.description,
    severity: threat.severity, // Direct assignment as types align
    location: {
      lat: threat.location.lat,
      lng: threat.location.lng,
      country: threat.location.country,
      city: threat.location.city || 'Unknown' // Fallback for city
    },
    timestamp: threat.timestamp,
    affectedSystems: threat.affectedSystems || [], // Ensure array, even if null/undefined from API
    attackType: threat.attackType, // Direct assignment as types align
    source: threat.source
  };
};

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<CyberIncident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all'); // New state for severity filter
  const [selectedAttackType, setSelectedAttackType] = useState<AttackType | 'all'>('all'); // New state for attack type filter
  const [filteredIncidents, setFilteredIncidents] = useState<CyberIncident[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
const [activeAnalytic, setActiveAnalytic] = useState<'country' | 'severity' | 'attackType' | 'timeline' | null>(null);
  // Use the hook to fetch threats data
  const { data: threatsResponse, isLoading, error, refetch } = useThreats(); // Renamed data to threatsResponse
  console.log('useThreats hook result:', { threatsResponse, isLoading, error });

  // Convert API threats to incidents or use sample data
  const allIncidents = useMemo(() => { // Changed React.useMemo to useMemo directly
    // Check if threatsResponse.threats exists and is an array
    if (threatsResponse && threatsResponse?.data && Array.isArray(threatsResponse?.data)) {
      console.log('Using API threats data:', threatsResponse?.data);
      return threatsResponse?.data?.map(convertThreatToIncident);
    }

    console.log('Using sample incidents data');
    return sampleIncidents;
  }, [threatsResponse]); // Dependency on threatsResponse

  console.log('Map component rendered with:', {
    threatsCount: threatsResponse?.threats?.length || 0,
    incidentsCount: allIncidents.length,
    isLoading,
    error
  });

  // Filter incidents based on search term and new dropdowns
  useEffect(() => {
    const filtered = allIncidents.filter(incident => {
      const matchesSearchTerm =
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.attackType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity =
        selectedSeverity === 'all' || incident.severity === selectedSeverity;

      const matchesAttackType =
        selectedAttackType === 'all' || incident.attackType === selectedAttackType;

      return matchesSearchTerm && matchesSeverity && matchesAttackType;
    });
    setFilteredIncidents(filtered);
    console.log('Filtered incidents updated:', filtered);
  }, [searchTerm, selectedSeverity, selectedAttackType, allIncidents]); // Add new dependencies

const getSeverityColor = (severity: Severity) => { // Use Severity type
  switch (severity) {
    case 'critical': return '#dc2626'; // cyber-critical
    case 'high': return '#ea580c'; // cyber-high
    case 'medium': return '#ca8a04'; // cyber-medium
    case 'low': return '#16a34a'; // cyber-low
    default: return '#0891b2'; // cyber-info (should not be reached with proper Severity type)
  }
};

const getAttackTypeSymbol = (attackType: AttackType): string => {
  switch (attackType) {
    case 'Malware': return '⚠️';
    case 'Phishing': return '🎣';
    case 'DDoS': return '💥';
    case 'Exploit': return '⚡';
    case 'InsiderThreat': return '👤';
    case 'Physical': return '🔒';
    case 'SupplyChain': return '🔗';
    case 'WebAttack': return '🌐';
    case 'AccountCompromise': return '🔑';
    case 'DataBreach': return '📊';
    case 'Ransomware': return '🔐';
    default: return '❗';
  }
};

const addMarkersToMap = () => {
  if (!map.current || !mapLoaded) {
    console.log('Map not ready for markers:', { mapExists: !!map.current, mapLoaded });
    return;
  }

  console.log('Adding markers for incidents:', filteredIncidents);

  // Clear existing markers first
  const existingMarkers = document.querySelectorAll('.cyber-incident-marker');
  existingMarkers.forEach(marker => marker.remove());

  // Add incident markers
  filteredIncidents.forEach((incident) => {
    console.log(`Adding marker for incident: ${incident.title} at ${incident.location.lat}, ${incident.location.lng}`);

    const markerElement = document.createElement('div');
    markerElement.className = 'cyber-incident-marker';
    
    // Add the symbol as content
    markerElement.innerHTML = `<span class="threat-symbol">${getAttackTypeSymbol(incident.attackType)}</span>`;
    
    markerElement.style.cssText = `
      position: absolute;
      width: 24px;
      height: 24px;
      border-radius: 80%;
      background-color: rgba(229, 233, 8, 0.3);
      border: 3px solid ${getSeverityColor(incident.severity)};
      cursor: pointer;
      box-shadow: 0 0 15px ${getSeverityColor(incident.severity)}aa;
      z-index: 50;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Style the symbol
    const symbolElement = markerElement.querySelector('.threat-symbol') as HTMLElement;
    if (symbolElement) {
      symbolElement.style.cssText = `
        font-size: 12px;
        line-height: 2;
        filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8));
        user-select: none;
        pointer-events: none;
      `;
    }

    const marker = new mapboxgl.Marker({
      element: markerElement,
      anchor: 'center'
    })
      .setLngLat([incident.location.lng, incident.location.lat])
      .addTo(map.current!);

    console.log(`Marker added for ${incident.title}`);

    markerElement.addEventListener('click', () => {
      console.log('Marker clicked:', incident.title);
      setSelectedIncident(incident);
    });
  });
};



  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) {
      console.log('Map initialization blocked:', { container: !!mapContainer.current, token: !!mapboxToken });
      return;
    }

    console.log('Initializing map with token:', mapboxToken.substring(0, 10) + '...');

    // Initialize map
    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        // style: 'mapbox://styles/mapbox/dark-v11',
        // style: 'mapbox://styles/mapbox/light-v11',
        // style: 'mapbox://styles/mapbox/light-v11',
        style: 'mapbox://styles/mapbox/navigation-day-v1',
        projection: 'globe',
        zoom: 2,
        center: [30, 15],
        pitch: 0,
      });

      console.log('Map created, adding event listeners');

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'bottom-left'
      );

      // Add load event listener
      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);

        // Add atmosphere and fog effects for the globe
        map.current?.setFog({
          color: 'rgb(30, 30, 50)',
          'high-color': 'rgb(50, 80, 120)',
          'horizon-blend': 0.3,
        });

        toast.success("CyberMap loaded! Click on incident markers to view details.");
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        toast.error("Map error occurred");
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error("Failed to initialize map. Please check your Mapbox token.");
    }

    // Cleanup
    return () => {
      console.log('Cleaning up map');
      map.current?.remove();
      setMapLoaded(false);
    };
  }, [mapboxToken]);

  // Add markers when map is loaded or incidents change
  useEffect(() => {
    if (mapLoaded) {
      console.log('Map loaded, adding markers');
      addMarkersToMap();
    }
  }, [mapLoaded, filteredIncidents]);

return (
  <div className="relative w-full h-screen">
    {/* Search and Stats Panel - LEFT SIDE */}
    <div className="absolute top-4 left-4 z-10 space-y-4">
      <Card className="w-80 cyber-shadow z-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm gradient-text">Global Threat Monitor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-2"
          />
          {/* Severity Dropdown */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as Severity | 'all')}
            className="w-full p-2 border rounded-md bg-gray-800 text-white text-sm mb-2"
          >
            <option value="all">All Severities</option>
            {SEVERITY_OPTIONS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          {/* Attack Type Dropdown */}
          <select
            value={selectedAttackType}
            onChange={(e) => setSelectedAttackType(e.target.value as AttackType | 'all')}
            className="w-full p-2 border rounded-md bg-gray-800 text-white text-sm mb-2"
          >
            <option value="all">All Attack Types</option>
            {ATTACK_TYPE_OPTIONS.map(at => (
              <option key={at} value={at}>{at}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Critical: {filteredIncidents.filter(i => i.severity === 'critical').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span>High: {filteredIncidents.filter(i => i.severity === 'high').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <span>Medium: {filteredIncidents.filter(i => i.severity === 'medium').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span>Low: {filteredIncidents.filter(i => i.severity === 'low').length}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Total Incidents: {filteredIncidents.length}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Analytics Buttons Panel - RIGHT SIDE */}
    <div className="absolute top-4 right-4 z-10 space-y-4">
      <Card className="w-64 cyber-shadow z-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm gradient-text">Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            onClick={() => setActiveAnalytic('country')}
            className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg transition-all duration-200 text-left group"
          >
            <BarChart3 className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
            <div>
              <div className="text-white text-sm font-medium">Country Analysis</div>
              <div className="text-gray-400 text-xs">Geographic threat distribution</div>
            </div>
          </button>

          <button
            onClick={() => setActiveAnalytic('severity')}
            className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg transition-all duration-200 text-left group"
          >
            <Shield className="w-5 h-5 text-red-400 group-hover:text-red-300" />
            <div>
              <div className="text-white text-sm font-medium">Severity Analysis</div>
              <div className="text-gray-400 text-xs">Risk level breakdown</div>
            </div>
          </button>

          <button
            onClick={() => setActiveAnalytic('attackType')}
            className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg transition-all duration-200 text-left group"
          >
            <Zap className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
            <div>
              <div className="text-white text-sm font-medium">Attack Types</div>
              <div className="text-gray-400 text-xs">Threat vector analysis</div>
            </div>
          </button>

          <button
            onClick={() => setActiveAnalytic('timeline')}
            className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg transition-all duration-200 text-left group"
          >
            <Clock className="w-5 h-5 text-green-400 group-hover:text-green-300" />
            <div>
              <div className="text-white text-sm font-medium">Timeline Analysis</div>
              <div className="text-gray-400 text-xs">Temporal patterns</div>
            </div>
          </button>
        </CardContent>
      </Card>
    </div>

    {/* Map Container */}
    <div ref={mapContainer} className="absolute inset-0" />

    {/* Incident Popup */}
    {selectedIncident && (
      <IncidentPopup
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    )}

    {/* Analytics Modals */}
    {activeAnalytic === 'country' && (
      <CountryAnalytics
        incidents={filteredIncidents}
        onClose={() => setActiveAnalytic(null)}
      />
    )}

    {activeAnalytic === 'severity' && (
      <SeverityAnalytics
        incidents={filteredIncidents}
        onClose={() => setActiveAnalytic(null)}
      />
    )}

    {activeAnalytic === 'attackType' && (
      <AttackTypeAnalytics
        incidents={filteredIncidents}
        onClose={() => setActiveAnalytic(null)}
      />
    )}

    {activeAnalytic === 'timeline' && (
      <TimelineAnalytics
        incidents={filteredIncidents}
        onClose={() => setActiveAnalytic(null)}
      />
    )}
  </div>
);

};

export default Map;
