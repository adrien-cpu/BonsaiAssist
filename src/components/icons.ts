/**
 * @fileOverview Collection d'icônes utilisées dans l'application.
 * Ce fichier importe et réexporte une sélection d'icônes de la bibliothèque `lucide-react`
 * sous un alias `Icons` pour une utilisation simplifiée.
 */

// Importation des icônes spécifiques de lucide-react
import {
  ArrowRight,
  Check,
  ChevronsUpDown, // Peut être utilisé pour les menus déroulants
  Circle,
  Copy,
  Edit,
  ExternalLink,
  File,
  HelpCircle,
  Home,
  Loader2, // Utilisé comme indicateur de chargement/spinner
  Mail,
  MessageSquare, // Pourrait être utilisé pour un chatbot
  Moon, // Icône pour le thème sombre
  Plus,
  PlusCircle,
  Search,
  Server, // Pourrait représenter le backend ou l'IA
  Settings,
  Share2,
  Shield, // Pourrait représenter la sécurité ou la validation
  Sun, // Icône pour le thème clair
  Trash, // Pour la suppression
  User,
  X, // Icône de fermeture
  Workflow, // Pourrait représenter les flux AI
} from 'lucide-react';

/**
 * Objet contenant les icônes importées pour une utilisation facile dans l'application.
 * Chaque clé correspond à un nom d'usage courant et la valeur est le composant Icône de Lucide.
 * @type {Record<string, React.ElementType>}
 */
const Icons = {
  arrowRight: ArrowRight,
  check: Check,
  chevronUpDown: ChevronsUpDown, // Renommé pour la clarté
  circle: Circle,
  workflow: Workflow,
  close: X,
  copy: Copy,
  dark: Moon,
  edit: Edit,
  externalLink: ExternalLink,
  file: File,
  help: HelpCircle,
  home: Home,
  light: Sun,
  loader: Loader2,
  mail: Mail,
  messageSquare: MessageSquare,
  plus: Plus,
  plusCircle: PlusCircle,
  search: Search,
  server: Server,
  settings: Settings,
  share: Share2,
  shield: Shield,
  spinner: Loader2, // Alias commun pour loader
  trash: Trash,
  user: User,
};

// Exportation de l'objet Icons pour utilisation dans d'autres composants
export { Icons };
