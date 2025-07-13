import React from 'react';
import { Header } from '@/components/Header';
import Map from '@/components/Map';
import { useThreats } from '@/hooks/useThreats';
import heroImage from '@/assets/cyber-hero.jpg';

const Index = () => {
  const { data: threats, isLoading, error } = useThreats();

  console.log('API Response:', threats); // Debug log

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/60" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Real-time Global Cyber Threat Intelligence</h2>
            <p className="text-muted-foreground">Track and visualize cybersecurity incidents worldwide</p>
            {isLoading && <p className="text-sm text-muted-foreground">Loading threats...</p>}
            {error && <p className="text-sm text-red-500">Error loading threats</p>}
          </div>
        </div>
      </div>

      {/* Map Section - Pass threats data as props */}
      <div className="h-[calc(100vh-8rem)]">
        <Map 
          threats={threats} 
          isLoading={isLoading} 
          error={error} 
        />
      </div>
    </div>
  );
};

export default Index;
