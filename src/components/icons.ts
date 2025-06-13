import {
  Camera,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Menu,
  Settings,
  User,
  Home,
  Calendar,
  Bell,
  Droplets,
  Scissors,
  Eye,
  TreePine,
  Leaf,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Wind,
  Activity,
  BarChart3,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Share,
  Heart,
  Star,
  Bookmark,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Copy,
  Trash2,
  Edit,
  Save,
  FileText,
  Image,
  Video,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Bluetooth,
  BluetoothConnected,
  HardDrive,
  Cpu,
  MemoryStick,
  Printer,
  Keyboard,
  Mouse,
  Headphones,
  Gamepad2,
  Joystick,
  MessageCircle,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Target,
  type LucideIcon,
} from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
  // Navigation
  menu: Menu,
  home: Home,
  settings: Settings,
  user: User,
  
  // Actions
  camera: Camera,
  search: Search,
  plus: Plus,
  edit: Edit,
  save: Save,
  copy: Copy,
  trash: Trash2,
  download: Download,
  upload: Upload,
  share: Share,
  
  // Status
  spinner: Loader2,
  loading: Loader2,
  alert: AlertCircle,
  success: CheckCircle,
  info: Info,
  close: X,
  
  // Bonsai specific
  tree: TreePine,
  leaf: Leaf,
  scissors: Scissors,
  droplets: Droplets,
  eye: Eye,
  
  // Weather
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  thermometer: Thermometer,
  wind: Wind,
  
  // UI
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  
  // Time & Calendar
  calendar: Calendar,
  clock: Clock,
  bell: Bell,
  
  // Data & Analytics
  activity: Activity,
  barChart: BarChart3,
  trendingUp: TrendingUp,
  
  // Location
  mapPin: MapPin,
  
  // Devices
  smartphone: Smartphone,
  monitor: Monitor,
  tablet: Tablet,
  
  // Media
  image: Image,
  video: Video,
  mic: Mic,
  volume: Volume2,
  volumeOff: VolumeX,
  play: Play,
  pause: Pause,
  
  // Interaction
  heart: Heart,
  star: Star,
  bookmark: Bookmark,
  
  // Layout
  grid: Grid,
  list: List,
  filter: Filter,
  sortAsc: SortAsc,
  sortDesc: SortDesc,
  
  // Transform
  maximize: Maximize,
  minimize: Minimize,
  rotate: RotateCcw,
  rotateRight: RotateCw,
  zoomIn: ZoomIn,
  zoomOut: ZoomOut,
  move: Move,
  
  // Files
  file: FileText,
  
  // Connectivity
  wifi: Wifi,
  wifiOff: WifiOff,
  bluetooth: Bluetooth,
  bluetoothConnected: BluetoothConnected,
  
  // Hardware
  battery: Battery,
  batteryLow: BatteryLow,
  cpu: Cpu,
  hardDrive: HardDrive,
  memory: MemoryStick,
  
  // Peripherals
  printer: Printer,
  keyboard: Keyboard,
  mouse: Mouse,
  headphones: Headphones,
  gamepad: Gamepad2,
  joystick: Joystick,
  
  // Communication
  message: MessageCircle,
  
  // Learning & Community
  book: BookOpen,
  users: Users,
  award: Award,
  target: Target,
} as const

export type IconName = keyof typeof Icons