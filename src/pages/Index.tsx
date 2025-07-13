import React from 'react';
import { Header } from '@/components/Header';
import Map from '@/components/Map';


const Index = () => {


  return (
    <div className="min-h-screen bg-background">
      {/* Map Section - Pass threats data as props */}
      <div className="h-[calc(100vh-8rem)]">
        <Map />
      </div>
    </div>
  );
};

export default Index;
