import React from 'react';

interface HubLayoutProps {
  Header: React.ReactNode;
  Body: React.ReactNode;
}

export default function HubLayout({ Header, Body }: HubLayoutProps) {
  return (
    <div className="container mx-auto p-2 sm:p-6 space-y-2 sm:space-y-6 pb-20 md:pb-6">
      {Header}
      {Body}
    </div>
  );
}