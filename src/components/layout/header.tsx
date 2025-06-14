import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'; // Assuming you want to reuse these components
interface HeaderProps {
  // Define any props for the header if needed
}

const Header: React.FC<HeaderProps> = () => {
  const mainNavItems = [
    {
      id: 'dashboard',
      title: 'Tableau de bord',
      icon: Icons.home,
      description: 'Vue d&apos;ensemble de vos bonsaïs',
    },
    {
      id: 'identify',
      title: 'Identifier',
      icon: Icons.search,
      description: 'Identification d&apos;espèces',
    },
    {
      id: 'collection',
      title: 'Ma Collection',
      icon: Icons.tree,
      description: 'Gérer vos bonsaïs',
    },
    {
      id: 'care',
      title: 'Soins',
      icon: Icons.droplets,
      description: 'Calendrier et rappels',
    },
    {
      id: 'pruning',
      title: 'Taille',
      icon: Icons.scissors,
      description: 'Guide de taille IA',
    },
    {
      id: 'visualization',
      title: 'Visualisation 3D',
      icon: Icons.eye,
      description: 'Modèle 3D interactif',
    },
  ];

  const toolsNavItems = [
    {
      id: 'weather',
      title: 'Météo',
      icon: Icons.cloud,
      description: 'Conditions météorologiques',
    },
    {
      id: 'tutorials',
      title: 'Tutoriels',
      icon: Icons.file,
      description: 'Guides d&apos;apprentissage',
    },
    {
      id: 'community',
      title: 'Communauté',
      icon: Icons.share,
      description: 'Partage et discussions',
    },
  ];

  const accountNavItems = [
    {
      id: 'profile',
      title: 'Profil',
      icon: Icons.user,
      description: 'Informations personnelles',
    },
    {
      id: 'settings',
      title: 'Paramètres',
      icon: Icons.settings,
      description: 'Configuration de l&apos;app',
    },
    {
      id: 'help',
      title: 'Aide',
      icon: Icons.info,
      description: 'Support et documentation',
    },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Combine all navigation items for easier mapping
  const allNavItems = [...mainNavItems, ...toolsNavItems, ...accountNavItems];

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        Your App Title
      </div>
      <div className="flex items-center">
        {/* Hamburger icon for smaller screens */}
        <button className="text-white md:hidden" onClick={toggleMenu}>
          <Icons.menu className="h-6 w-6" />
        </button>

        {/* Navigation links - hidden on smaller screens by default */}
        <nav className={`header-nav ${isMenuOpen ? 'header-nav-open' : ''} hidden md:block`}>
          <ul className="flex space-x-4">
            {allNavItems.map((item) => (
              <li key={item.id}>
                {/* You can use SidebarMenuButton or a simple link here */}
                <a href="#" className="text-white hover:text-gray-300">
                   {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Mobile menu - visible when isMenuOpen is true on smaller screens */}
      {isMenuOpen && (
        <div className="header-nav-mobile md:hidden absolute top-16 left-0 w-full bg-gray-800 z-10">
           <ul className="flex flex-col space-y-2 p-4">
            {allNavItems.map((item) => (
              <li key={item.id}>
                 {/* You can use SidebarMenuButton or a simple link here */}
                <a href="#" className="text-white hover:text-gray-300">
                   {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export { Header };