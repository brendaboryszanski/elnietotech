import {
  Wifi,
  WifiOff,
  Settings,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Camera,
  MessageCircle,
  Mail,
  Battery,
  BatteryLow,
  BatteryCharging,
  Bluetooth,
  BluetoothOff,
  Power,
  RotateCcw,
  Home,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Mic,
  MicOff,
  Bell,
  BellOff,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  Share2,
  Image,
  Video,
  Music,
  Globe,
  MapPin,
  Clock,
  Calendar,
  User,
  Users,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Printer,
  Headphones,
  Speaker,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Icon definitions with Spanish descriptions for the AI
export interface IconDefinition {
  icon: LucideIcon;
  keywords: string[];
  description: string;
}

export const ICON_BANK: Record<string, IconDefinition> = {
  // Connectivity
  wifi: {
    icon: Wifi,
    keywords: ["wifi", "internet", "conexión", "red", "señal"],
    description: "Ícono de WiFi - las rayitas curvas",
  },
  wifiOff: {
    icon: WifiOff,
    keywords: ["wifi apagado", "sin internet", "sin conexión"],
    description: "WiFi apagado - rayitas con una línea cruzada",
  },
  bluetooth: {
    icon: Bluetooth,
    keywords: ["bluetooth", "auriculares", "conectar"],
    description: "Ícono de Bluetooth - como una B rara",
  },
  bluetoothOff: {
    icon: BluetoothOff,
    keywords: ["bluetooth apagado"],
    description: "Bluetooth apagado",
  },

  // Settings & System
  settings: {
    icon: Settings,
    keywords: ["configuración", "ajustes", "ruedita", "engranaje", "opciones"],
    description: "Ruedita de configuración - el engranaje",
  },
  power: {
    icon: Power,
    keywords: ["encender", "apagar", "prender", "botón", "power"],
    description: "Botón de encendido - el circulito con la rayita",
  },
  restart: {
    icon: RotateCcw,
    keywords: ["reiniciar", "resetear", "volver a empezar"],
    description: "Flechita circular para reiniciar",
  },
  home: {
    icon: Home,
    keywords: ["inicio", "casa", "principal", "home"],
    description: "Casita - botón de inicio",
  },
  menu: {
    icon: Menu,
    keywords: ["menú", "tres rayitas", "opciones", "hamburguesa"],
    description: "Tres rayitas horizontales - el menú",
  },

  // Volume & Sound
  volume: {
    icon: Volume2,
    keywords: ["volumen", "sonido", "alto", "parlante"],
    description: "Parlante con sonido",
  },
  mute: {
    icon: VolumeX,
    keywords: ["silencio", "mudo", "sin sonido", "volumen apagado"],
    description: "Parlante tachado - silencio",
  },
  bell: {
    icon: Bell,
    keywords: ["notificación", "campanita", "alerta", "sonido"],
    description: "Campanita de notificaciones",
  },
  bellOff: {
    icon: BellOff,
    keywords: ["silencio", "no molestar", "campanita tachada"],
    description: "Campanita tachada - no molestar",
  },
  mic: {
    icon: Mic,
    keywords: ["micrófono", "hablar", "voz", "grabar"],
    description: "Micrófono",
  },
  micOff: {
    icon: MicOff,
    keywords: ["micrófono apagado", "silenciado"],
    description: "Micrófono tachado",
  },

  // Phone & Communication
  phone: {
    icon: Phone,
    keywords: ["teléfono", "llamar", "llamada"],
    description: "Teléfono para llamar",
  },
  phoneOff: {
    icon: PhoneOff,
    keywords: ["colgar", "terminar llamada"],
    description: "Teléfono rojo para colgar",
  },
  message: {
    icon: MessageCircle,
    keywords: ["mensaje", "chat", "whatsapp", "sms", "texto"],
    description: "Globito de mensaje",
  },
  mail: {
    icon: Mail,
    keywords: ["correo", "email", "mail", "sobre"],
    description: "Sobre de correo electrónico",
  },

  // Battery
  battery: {
    icon: Battery,
    keywords: ["batería", "pila", "carga"],
    description: "Batería",
  },
  batteryLow: {
    icon: BatteryLow,
    keywords: ["batería baja", "poca pila"],
    description: "Batería baja - poca carga",
  },
  batteryCharging: {
    icon: BatteryCharging,
    keywords: ["cargando", "enchufado", "cargador"],
    description: "Batería cargando - con el rayito",
  },

  // Camera & Media
  camera: {
    icon: Camera,
    keywords: ["cámara", "foto", "sacar foto"],
    description: "Cámara de fotos",
  },
  image: {
    icon: Image,
    keywords: ["foto", "imagen", "galería", "álbum"],
    description: "Ícono de imagen/foto",
  },
  video: {
    icon: Video,
    keywords: ["video", "grabar", "filmadora"],
    description: "Cámara de video",
  },
  music: {
    icon: Music,
    keywords: ["música", "canción", "audio"],
    description: "Nota musical",
  },

  // Security
  lock: {
    icon: Lock,
    keywords: ["bloqueado", "candado", "seguridad", "cerrado"],
    description: "Candado cerrado",
  },
  unlock: {
    icon: Unlock,
    keywords: ["desbloqueado", "abierto"],
    description: "Candado abierto",
  },
  eye: {
    icon: Eye,
    keywords: ["ver", "mostrar", "contraseña visible"],
    description: "Ojito para ver",
  },
  eyeOff: {
    icon: EyeOff,
    keywords: ["ocultar", "contraseña oculta"],
    description: "Ojito tachado - ocultar",
  },

  // Navigation
  search: {
    icon: Search,
    keywords: ["buscar", "lupa", "encontrar"],
    description: "Lupa para buscar",
  },
  back: {
    icon: ChevronLeft,
    keywords: ["atrás", "volver", "flecha izquierda"],
    description: "Flecha para volver atrás",
  },
  forward: {
    icon: ChevronRight,
    keywords: ["siguiente", "adelante", "flecha derecha"],
    description: "Flecha para ir adelante",
  },
  up: {
    icon: ChevronUp,
    keywords: ["arriba", "subir"],
    description: "Flecha hacia arriba",
  },
  down: {
    icon: ChevronDown,
    keywords: ["abajo", "bajar", "desplegar"],
    description: "Flecha hacia abajo",
  },
  close: {
    icon: X,
    keywords: ["cerrar", "cruz", "cancelar", "equis"],
    description: "Cruz para cerrar",
  },

  // Actions
  download: {
    icon: Download,
    keywords: ["descargar", "bajar", "guardar"],
    description: "Flecha hacia abajo - descargar",
  },
  upload: {
    icon: Upload,
    keywords: ["subir", "cargar", "enviar archivo"],
    description: "Flecha hacia arriba - subir",
  },
  delete: {
    icon: Trash2,
    keywords: ["borrar", "eliminar", "tacho", "basura"],
    description: "Tacho de basura - borrar",
  },
  edit: {
    icon: Edit,
    keywords: ["editar", "modificar", "lápiz"],
    description: "Lápiz para editar",
  },
  copy: {
    icon: Copy,
    keywords: ["copiar", "duplicar"],
    description: "Dos cuadraditos - copiar",
  },
  share: {
    icon: Share2,
    keywords: ["compartir", "enviar", "mandar"],
    description: "Flechita para compartir",
  },

  // Status
  help: {
    icon: HelpCircle,
    keywords: ["ayuda", "pregunta", "signo de pregunta"],
    description: "Signo de pregunta - ayuda",
  },
  warning: {
    icon: AlertCircle,
    keywords: ["advertencia", "alerta", "atención", "cuidado"],
    description: "Signo de exclamación - advertencia",
  },
  success: {
    icon: CheckCircle,
    keywords: ["listo", "correcto", "bien", "ok", "tilde"],
    description: "Tilde verde - todo bien",
  },
  error: {
    icon: XCircle,
    keywords: ["error", "mal", "problema", "cruz roja"],
    description: "Cruz roja - error",
  },
  info: {
    icon: Info,
    keywords: ["información", "info", "i"],
    description: "Letra i - información",
  },

  // Other
  globe: {
    icon: Globe,
    keywords: ["internet", "navegador", "web", "mundo"],
    description: "Mundo/globo - internet",
  },
  location: {
    icon: MapPin,
    keywords: ["ubicación", "lugar", "gps", "mapa"],
    description: "Pin de ubicación",
  },
  clock: {
    icon: Clock,
    keywords: ["hora", "reloj", "tiempo"],
    description: "Reloj",
  },
  calendar: {
    icon: Calendar,
    keywords: ["calendario", "fecha", "día"],
    description: "Calendario",
  },
  user: {
    icon: User,
    keywords: ["usuario", "persona", "perfil", "cuenta"],
    description: "Persona - perfil de usuario",
  },
  contacts: {
    icon: Users,
    keywords: ["contactos", "personas", "agenda"],
    description: "Personas - contactos",
  },
  brightness: {
    icon: Sun,
    keywords: ["brillo", "sol", "pantalla clara"],
    description: "Sol - brillo de pantalla",
  },
  darkMode: {
    icon: Moon,
    keywords: ["modo oscuro", "noche", "luna"],
    description: "Luna - modo oscuro",
  },
  flash: {
    icon: Zap,
    keywords: ["flash", "rayo", "linterna"],
    description: "Rayito - flash/linterna",
  },

  // Devices
  phone_device: {
    icon: Smartphone,
    keywords: ["celular", "teléfono", "smartphone", "móvil"],
    description: "Celular/smartphone",
  },
  tablet: {
    icon: Tablet,
    keywords: ["tablet", "ipad", "tableta"],
    description: "Tablet",
  },
  computer: {
    icon: Monitor,
    keywords: ["computadora", "monitor", "pantalla", "pc"],
    description: "Monitor de computadora",
  },
  tv: {
    icon: Tv,
    keywords: ["televisor", "tv", "tele", "pantalla"],
    description: "Televisor",
  },
  printer: {
    icon: Printer,
    keywords: ["impresora", "imprimir"],
    description: "Impresora",
  },
  headphones: {
    icon: Headphones,
    keywords: ["auriculares", "cascos", "audífonos"],
    description: "Auriculares",
  },
  speaker: {
    icon: Speaker,
    keywords: ["parlante", "altavoz", "bocina"],
    description: "Parlante/altavoz",
  },
};

// Find icon by keyword
export function findIconByKeyword(query: string): IconDefinition | null {
  const lowerQuery = query.toLowerCase();
  
  for (const [, def] of Object.entries(ICON_BANK)) {
    if (def.keywords.some(kw => lowerQuery.includes(kw) || kw.includes(lowerQuery))) {
      return def;
    }
  }
  
  return null;
}

// Get icon component by key
export function getIcon(key: string): LucideIcon | null {
  return ICON_BANK[key]?.icon || null;
}

