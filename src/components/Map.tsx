import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IncidentPopup } from './IncidentPopup';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Threat } from '@/types/threats';
import { useThreats } from '@/hooks/useThreats';

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;


export interface CyberIncident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: {
    lat: number;
    lng: number;
    country: string;
    city: string;
  };
  timestamp: string;
  affectedSystems: string[];
  attackType: string;
  source?: string;
}
// Props interface for Map component
interface MapProps {
  threats?: { threats: Threat[] } | null;
  isLoading?: boolean;
  error?: any;
}

// Sample data structure for demonstration
const sampleIncidents: CyberIncident[] = [
  {
    id: '1',
    title: 'Advanced Persistent Threat Detected',
    description: 'Sophisticated APT group targeting critical infrastructure with zero-day exploits.',
    severity: 'critical',
    location: { lat: 40.7128, lng: -74.0060, country: 'USA', city: 'New York' },
    timestamp: new Date().toISOString(),
    affectedSystems: ['Industrial Control Systems', 'Financial Networks'],
    attackType: 'APT',
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
    attackType: 'Data Breach',
    source: 'Internal Security'
  }
];

const convertThreatToIncident = (threat: Threat): CyberIncident => {
  return {
    id: threat.id,
    title: threat.title, // Use type as title
    description: threat.description,
    severity: threat.severity as 'critical' | 'high' | 'medium' | 'low',
    location: {
      lat: threat.location.lat,
      lng: threat.location.lng,
      country: threat.location.country,
      city: threat.location.city || 'Unknown'
    },
    timestamp: threat.timestamp,
    affectedSystems: [], // API might not have this field
    attackType: threat.attackType,
    source: threat.source
  };
};

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<CyberIncident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIncidents, setFilteredIncidents] = useState<CyberIncident[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Use the hook to fetch threats data
  const { data: threats, isLoading, error, refetch } = useThreats();
  console.log('useThreats hook result:', { threats, isLoading, error });
  // Convert API threats to incidents or use sample data
  const allIncidents = React.useMemo(() => {
    if (threats && threats?.data) {
      console.log('Using API threats data:', threats?.data);
      return threats?.data?.map(convertThreatToIncident);
    }

    console.log('Using sample incidents data');
    return sampleIncidents;
  }, [threats]);

  console.log('Map component rendered with:', { 
    threatsCount: threats?.threats?.length || 0, 
    incidentsCount: allIncidents.length,
    isLoading,
    error 
  });

  // Filter incidents based on search term
  useEffect(() => {
    const filtered = allIncidents.filter(incident =>
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.attackType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIncidents(filtered);
    console.log('Filtered incidents updated:', filtered);
  }, [searchTerm, allIncidents]);
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626'; // cyber-critical
      case 'high': return '#ea580c'; // cyber-high  
      case 'medium': return '#ca8a04'; // cyber-medium
      case 'low': return '#16a34a'; // cyber-low
      default: return '#0891b2'; // cyber-info
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
      markerElement.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${getSeverityColor(incident.severity)};
        border: 3px solid rgba(255, 255, 255, 0.8);
        cursor: pointer;
        box-shadow: 0 0 15px ${getSeverityColor(incident.severity)}aa;
        z-index: 50;
        transform: translate(-50%, -50%);
      `;

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
        style: 'mapbox://styles/mapbox/light-v11',
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

  // if (!mapboxToken) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center p-4">
  //       <Card className="w-full max-w-md">
  //         <CardHeader>
  //           <CardTitle className="gradient-text">CyberSecurity Map Setup</CardTitle>
  //         </CardHeader>
  //         <CardContent className="space-y-4">
  //           <p className="text-muted-foreground">
  //             Please enter your Mapbox public token to view the cybersecurity incident map.
  //           </p>
  //           <Input
  //             type="text"
  //             placeholder="Enter Mapbox public token..."
  //             value={mapboxToken}
  //             onChange={(e) => setMapboxToken(e.target.value)}
  //             className="w-full"
  //           />
  //           <p className="text-sm text-muted-foreground">
  //             Get your token at{' '}
  //             <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
  //               mapbox.com
  //             </a>
  //           </p>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="relative w-full h-screen">
      {/* Debug Info */}
      <div className="absolute top-4 right-4 z-10 bg-black/70 text-white p-2 text-xs">
        <div>Map Loaded: {mapLoaded ? 'Yes' : 'No'}</div>
        <div>Incidents: {filteredIncidents.length}</div>
        <div>Token: {mapboxToken ? 'Set' : 'Not Set'}</div>
      </div>

      {/* Search and Stats Panel */}
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
              className="w-full"
            />
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

      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Incident Popup */}
      {selectedIncident && (
        <IncidentPopup
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
};

export default Map;
