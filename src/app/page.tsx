'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
import {useEffect, useState} from 'react';

export default function Home() {
  const [is3DViewEnabled, set3DViewEnabled] = useState(false);

  // Placeholder function for species identification
  const identifySpecies = () => {
    alert('Species identification feature coming soon!');
  };

  // Placeholder function for pruning guidance
  const getPruningGuidance = () => {
    alert('Pruning guidance feature coming soon!');
  };

  // Function to toggle 3D view
  const toggle3DView = () => {
    set3DViewEnabled(!is3DViewEnabled);
  };

  return (
    <SidebarProvider>
      <div className="md:pl-64">
        <Sidebar
          collapsible="icon"
          width="w-64"
          style={{background: '#F0EAD6'}}>
          <SidebarHeader>
            <SidebarTrigger>
              <Button variant="ghost" size="sm">
                Toggle Sidebar
              </Button>
            </SidebarTrigger>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>BonsAI Assist</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={identifySpecies}>
                    Identify Species
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={getPruningGuidance}>
                    Get Pruning Guidance
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={toggle3DView}>
                    Toggle 3D Visualization
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter></SidebarFooter>
        </Sidebar>
        <div className="p-4">
          <h1 className="text-2xl font-bold">Welcome to BonsAI Assist</h1>
          <p>Your digital companion for bonsai care.</p>
          {is3DViewEnabled && (
            <div className="mt-4">
              {/* Placeholder for 3D Visualization */}
              <img
                src="https://picsum.photos/400/300"
                alt="3D Bonsai Visualization"
                className="rounded-md shadow-md"
              />
              <p className="text-sm text-muted-foreground mt-2">
                3D visualization of your bonsai with suggested pruning areas.
              </p>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
