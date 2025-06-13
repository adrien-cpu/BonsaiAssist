import { Icons } from '@/components/icons';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
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

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>BonsAI Assist</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onPageChange(item.id)}
                    isActive={currentPage === item.id}
                    tooltip={item.description}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Outils</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNavItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onPageChange(item.id)}
                    isActive={currentPage === item.id}
                    tooltip={item.description}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Compte</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onPageChange(item.id)}
                    isActive={currentPage === item.id}
                    tooltip={item.description}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <p className="text-xs text-muted-foreground text-center">
            Créez de magnifiques bonsaïs avec l&apos;aide de l&apos;IA
          </p>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}