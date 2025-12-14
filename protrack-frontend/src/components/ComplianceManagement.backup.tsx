import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  CheckCircle,
  XCircle,
  Search,
  Eye,
  FileText,
  Download,
  RefreshCw,
  AlertTriangle,
  Shield,
  Gavel,
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  Clock,
  UserCheck,
  FileSignature,
  TestTube,
  RotateCcw,
  Filter,
  Calendar,
  MapPin,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Zap,
  Lock,
  Unlock,
  ExternalLink,
  Bell,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  AlertOctagon,
  Check,
  X,
  Info,
  ChevronRight,
  ChevronDown,
  BookOpen,
  ClipboardList,
  Database,
  Key,
  Hash,
  Link,
  Globe,
  Server,
  Smartphone,
  Package,
  Truck,
  Home,
  Factory,
  Store,
  Users,
  User,
  Building,
  Flag,
  Tag,
  Box,
  Layers,
  Grid,
  List,
  Sliders,
  Printer,
  Mail,
  Phone,
  Map,
  Navigation,
  Target,
  Award,
  Star,
  Heart,
  Share2,
  Copy,
  Scissors,
  Archive,
  Send,
  MessageSquare,
  CalendarClock,
  Timer,
  Activity,
  Wifi,
  Bluetooth,
  Signal,
  Battery,
  BatteryCharging,
  Power,
  Volume2,
  VolumeX,
  Mic,
  Camera,
  Video,
  Image,
  Film,
  Music,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Airplay,
  Cast,
  Disc,
  Headphones,
  MicOff,
  Radio,
  Tv,
  Monitor,
  Laptop,
  Tablet,
  Mouse,
  Keyboard,
  PrinterIcon,
  HardDrive,
  Cpu,
  Watch,
  SmartphoneCharging,
  TabletSmartphone,
  Laptop2,
  ServerCog,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudOff,
  UploadCloud as CloudUpload,
  Download as CloudDownload,
  CloudCog,
  DatabaseBackup,
  HardDriveUpload,
  HardDriveDownload,
  Network,
  Cable as Ethernet,
  Usb,
  CircuitBoard,
  Cable,
  Plug,
  PlugZap,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  BatteryWarning,
  BatteryCharging as BatteryChargingFull,
  Flashlight,
  FlashlightOff,
  Siren,
  Fan,
  Theater as Heater,
  Thermometer as Thermostat,
  Snowflake,
  Flame,
  Magnet,
  Lightbulb,
  LightbulbOff,
  Flashlight as FlashlightOn,
  Lamp,
  LampCeiling,
  LampDesk,
  LampFloor,
  LampWallDown,
  LampWallUp,
  Candy,
  CandyOff,
  Cookie,
  Utensils,
  Wine,
  Beer,
  GlassWater,
  Milk,
  Leaf,
  TreePine,
  TreeDeciduous,
  Flower,
  Flower2,
  Nut,
  Wheat,
  Apple,
  Carrot,
  Egg,
  Fish,
  Beef,
  Pizza,
  Sandwich,
  Soup,
  Salad,
  IceCream,
  Cake,
  CookieIcon,
  CandyCane,
  Lollipop,
  Popcorn,
  ShoppingCart,
  Store,
  CreditCard,
  DollarSign,
  Euro,
  PoundSterling,
  IndianRupee,
  JapaneseYen,
  Bitcoin,
  Wallet,
  PiggyBank,
  Banknote,
  Coins,
  Receipt,
  Calculator,
  Percent,
  Tag,
  Ticket,
  Gift,
  ShoppingBag,
  Warehouse,
  Building2,
  Landmark,
  Tent,
  Home,
  Hotel,
  Hospital,
  School,
  University,
  Church,
  Castle,
  Mountain,
  MountainSnow,
  Trees,
  TreePine,
  TreeDeciduous,
  Flower,
  Flower2,
  Leaf,
  Nut,
  Wheat,
  Apple,
  Carrot,
  Egg,
  Fish,
  Beef,
  Pizza,
  Sandwich,
  Soup,
  Salad,
  IceCream,
  Cake,
  Cookie,
  CandyCane,
  Lollipop,
  Popcorn,
  Candy,
  Wine,
  Beer,
  GlassWater,
  Mug,
  CupSoda,
  Move,
  MoveDiagonal,
  MoveDiagonal2,
  MoveHorizontal,
  MoveVertical,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ArrowLeftRight,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  Expand,
  Shrink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  ListOrdered,
  ListUnordered,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  Code,
  Codepen,
  Codesandbox,
  Figma,
  Framer,
  PenTool,
  Paintbrush,
  Palette,
  Droplet,
  PaintBucket,
  Brush,
  Pencil,
  Eraser,
  ScissorsCutting,
  Stamp,
  Layers2,
  Grid2,
  Grid3,
  Columns,
  Rows,
  TableCellsMerge,
  TableCellsSplit,
  TableProperties,
  TableRowsSplit,
  TableColumnsSplit,
  Table2,
  CalendarDays,
  CalendarCheck,
  CalendarClockIcon,
  CalendarMinus,
  CalendarPlus,
  CalendarRange,
  CalendarSearch,
  CalendarX,
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12,
  AlarmClock,
  TimerReset,
  Stopwatch,
  Hourglass,
  AlarmCheck,
  AlarmMinus,
  AlarmPlus,
  Bed,
  BedDouble,
  BedSingle,
  Sofa,
  Armchair,
  Chair,
  LampTable,
  LampFloorIcon,
  LampWallDownIcon,
  LampWallUpIcon,
  LightbulbIcon,
  LightbulbOffIcon,
  FlashlightIcon,
  FlashlightOffIcon,
  SirenIcon,
  FanIcon,
  HeaterIcon,
  ThermostatIcon,
  SnowflakeIcon,
  FlameIcon,
  MagnetIcon,
  BatteryIcon,
  BatteryChargingIcon,
  BatteryFullIcon,
  BatteryMediumIcon,
  BatteryLowIcon,
  BatteryWarningIcon,
  PlugIcon,
  PlugZapIcon,
  WifiIcon,
  BluetoothIcon,
  SignalIcon,
  EthernetPort,
  UsbPort,
  CircuitBoardIcon,
  ChipIcon,
  CpuIcon,
  MemoryIcon,
  HardDriveIcon,
  DatabaseIcon,
  ServerIcon,
  CloudIcon,
  CloudUploadIcon,
  CloudDownloadIcon,
  CloudOffIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudDrizzleIcon,
  CloudCogIcon,
  SunIcon,
  Moon,
  Sunrise,
  Sunset,
  ThermometerIcon,
  ThermometerSun,
  ThermometerSnowflake,
  DropletsIcon,
  WindIcon,
  ZapIcon,
  ZapOff,
  Waves,
  Mountain,
  MountainSnow,
  Trees,
  TreePineIcon,
  TreeDeciduousIcon,
  FlowerIcon,
  Flower2Icon,
  LeafIcon,
  NutIcon,
  WheatIcon,
  AppleIcon,
  CarrotIcon,
  EggIcon,
  FishIcon,
  BeefIcon,
  ChickenIcon,
  PizzaIcon,
  SandwichIcon,
  SoupIcon,
  SaladIcon,
  IceCreamIcon,
  CakeIcon,
  CookieIconIcon,
  CandyCaneIcon,
  LollipopIcon,
  PopcornIcon,
  CandyCornIcon,
  HotdogIcon,
  HamburgerIcon,
  FrenchFriesIcon,
  TacoIcon,
  BurritoIcon,
  PizzaSliceIcon,
  SandwichCookieIcon,
  SoupPotIcon,
  SaladBowlIcon,
  IceCreamConeIcon,
  CakeSliceIcon,
  CookieJarIcon,
  CandyStoreIcon,
  RestaurantIcon,
  ChefHatIcon,
  CookingPotIcon,
  OvenIcon,
  MicrowaveIcon,
  RefrigeratorIcon,
  FreezerIcon,
  BlenderIcon,
  ToasterIcon,
  CoffeeIcon,
  TeaIcon,
  JuiceIcon,
  SodaIcon,
  WaterBottleIcon,
  WineGlassIcon,
  BeerBottleIcon,
  CocktailIcon,
  MartiniIcon,
  WineRackIcon,
  BeerTapIcon,
  KettleIcon,
  MugIcon,
  GlassIcon,
  CupIcon,
  BottleIcon,
  JarIcon,
  CanIcon,
  ShoppingCartIconIcon,
  StoreIconIcon,
  CreditCardIcon,
  DollarSignIcon,
  EuroIcon,
  PoundSterlingIcon,
  IndianRupeeIcon,
  JapaneseYenIcon,
  BitcoinIcon,
  EthereumIcon,
  WalletIcon,
  PiggyBankIcon,
  BanknoteIcon,
  CoinsIcon,
  ReceiptIcon,
  CalculatorIcon,
  PercentIcon,
  TagIconIcon,
  TicketIcon,
  GiftIcon,
  ShoppingBagIcon,
  StorefrontIcon,
  WarehouseIcon,
  Building2Icon,
  LandmarkIcon,
  TentIcon,
  HouseIcon,
  HotelIcon,
  HospitalIcon,
  SchoolIcon,
  UniversityIcon,
  ChurchIcon,
  CastleIcon,
  TowerIcon,
  BridgeIcon,
  DamIcon,
  FenceIcon,
  WallIcon,
  DoorClosedIcon,
  DoorOpenIcon,
  WindowIcon,
  WindowCloseIcon,
  WindowMaximizeIcon,
  WindowMinimizeIcon,
  WindowRestoreIcon,
  MaximizeIcon,
  MinimizeIcon,
  MoveIcon,
  MoveDiagonalIcon,
  MoveDiagonal2Icon,
  MoveHorizontalIcon,
  MoveVerticalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpDownIcon,
  ArrowLeftRightIcon,
  CornerUpLeftIcon,
  CornerUpRightIcon,
  CornerDownLeftIcon,
  CornerDownRightIcon,
  ChevronsUpIcon,
  ChevronsDownIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ExpandIcon,
  ShrinkIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  IndentIcon,
  OutdentIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  QuoteIcon,
  CodeIcon,
  CodepenIcon,
  CodesandboxIcon,
  FigmaIcon,
  FramerIcon,
  PenToolIcon,
  PaintbrushIcon,
  PaletteIcon,
  DropletIcon,
  PaintBucketIcon,
  BrushIcon,
  PencilIcon,
  EraserIcon,
  ScissorsCuttingIcon,
  StampIcon,
  Layers2Icon,
  Grid2Icon,
  Grid3Icon,
  ColumnsIcon,
  RowsIcon,
  TableCellsMergeIcon,
  TableCellsSplitIcon,
  TablePropertiesIcon,
  TableRowsSplitIcon,
  TableColumnsSplitIcon,
  Table2Icon,
  CalendarDaysIcon,
  CalendarCheckIcon,
  CalendarClockIconIcon,
  CalendarMinusIcon,
  CalendarPlusIcon,
  CalendarRangeIcon,
  CalendarSearchIcon,
  CalendarXIcon,
  Clock1Icon,
  Clock2Icon,
  Clock3Icon,
  Clock4Icon,
  Clock5Icon,
  Clock6Icon,
  Clock7Icon,
  Clock8Icon,
  Clock9Icon,
  Clock10Icon,
  Clock11Icon,
  Clock12Icon,
  AlarmClockIcon,
  TimerResetIcon,
  StopwatchIcon,
  HourglassIcon,
  AlarmCheckIcon,
  AlarmMinusIcon,
  AlarmPlusIcon,
  BedIcon,
  BedDoubleIcon,
  BedSingleIcon,
  SofaIcon,
  ArmchairIcon,
  ChairIcon,
  LampTableIcon,
  LampFloorIconIcon,
  LampWallDownIconIcon,
  LampWallUpIconIcon,
  LightbulbIconIcon,
  LightbulbOffIconIcon,
  FlashlightIconIcon,
  FlashlightOffIconIcon,
  SirenIconIcon,
  FanIconIcon,
  HeaterIconIcon,
  ThermostatIconIcon,
  SnowflakeIconIcon,
  FlameIconIcon,
  MagnetIconIcon,
  BatteryIconIcon,
  BatteryChargingIconIcon,
  BatteryFullIconIcon,
  BatteryMediumIconIcon,
  BatteryLowIconIcon,
  BatteryWarningIconIcon,
  PlugIconIcon,
  PlugZapIconIcon,
  WifiIconIcon,
  BluetoothIconIcon,
  SignalIconIcon,
  EthernetPortIcon,
  UsbPortIcon,
  CircuitBoardIconIcon,
  ChipIconIcon,
  CpuIconIcon,
  MemoryIconIcon,
  HardDriveIconIcon,
  DatabaseIconIcon,
  ServerIconIcon,
  CloudIconIcon,
  CloudUploadIconIcon,
  CloudDownloadIconIcon,
  CloudOffIconIcon,
  CloudLightningIconIcon,
  CloudRainIconIcon,
  CloudSnowIconIcon,
  CloudDrizzleIconIcon,
  CloudCogIconIcon,
  SunIconIcon,
  MoonIcon,
  SunriseIcon,
  SunsetIcon,
  ThermometerIconIcon,
  ThermometerSunIcon,
  ThermometerSnowflakeIcon,
  DropletsIconIcon,
  WindIconIcon,
  ZapIconIcon,
  ZapOffIcon,
  WavesIcon,
  MountainIcon,
  MountainSnowIcon,
  TreesIcon,
  TreePineIconIcon,
  TreeDeciduousIconIcon,
  FlowerIconIcon,
  Flower2IconIcon,
  LeafIconIcon,
  NutIconIcon,
  WheatIconIcon,
  AppleIconIcon,
  CarrotIconIcon,
  EggIconIcon,
  FishIconIcon,
  BeefIconIcon,
  ChickenIconIcon,
  PizzaIconIcon,
  SandwichIconIcon,
  SoupIconIcon,
  SaladIconIcon,
  IceCreamIconIcon,
  CakeIconIcon,
  CookieIconIconIcon,
  CandyCaneIconIcon,
  LollipopIconIcon,
  PopcornIconIcon,
  CandyCornIconIcon,
  HotdogIconIcon,
  HamburgerIconIcon,
  FrenchFriesIconIcon,
  TacoIconIcon,
  BurritoIconIcon,
  PizzaSliceIconIcon,
  SandwichCookieIconIcon,
  SoupPotIconIcon,
  SaladBowlIconIcon,
  IceCreamConeIconIcon,
  CakeSliceIconIcon,
  CookieJarIconIcon,
  CandyStoreIconIcon,
  RestaurantIconIcon,
  ChefHatIconIcon,
  CookingPotIconIcon,
  OvenIconIcon,
  MicrowaveIconIcon,
  RefrigeratorIconIcon,
  FreezerIconIcon,
  BlenderIconIcon,
  ToasterIconIcon,
  CoffeeIconIcon,
  TeaIconIcon,
  JuiceIconIcon,
  SodaIconIcon,
  WaterBottleIconIcon,
  WineGlassIconIcon,
  BeerBottleIconIcon,
  CocktailIconIcon,
  MartiniIconIcon,
  WineRackIconIcon,
  BeerTapIconIcon,
  KettleIconIcon,
  MugIconIcon,
  GlassIconIcon,
  CupIconIcon,
  BottleIconIcon,
  JarIconIcon,
  CanIconIcon,
  ShoppingCartIconIconIcon,
  StoreIconIconIcon,
  CreditCardIconIcon,
  DollarSignIconIcon,
  EuroIconIcon,
  PoundSterlingIconIcon,
  IndianRupeeIconIcon,
  JapaneseYenIconIcon,
  BitcoinIconIcon,
  EthereumIconIcon,
  WalletIconIcon,
  PiggyBankIconIcon,
  BanknoteIconIcon,
  CoinsIconIcon,
  ReceiptIconIcon,
  CalculatorIconIcon,
  PercentIconIcon,
  TagIconIconIcon,
  TicketIconIcon,
  GiftIconIcon,
  ShoppingBagIconIcon,
  StorefrontIconIcon,
  WarehouseIconIcon,
  Building2IconIcon,
  LandmarkIconIcon,
  TentIconIcon,
  HouseIconIcon,
  HotelIconIcon,
  HospitalIconIcon,
  SchoolIconIcon,
  UniversityIconIcon,
  ChurchIconIcon,
  CastleIconIcon,
  TowerIconIcon,
  BridgeIconIcon,
  DamIconIcon,
  FenceIconIcon,
  WallIconIcon,
  DoorClosedIconIcon,
  DoorOpenIconIcon,
  WindowIconIcon,
  WindowCloseIconIcon,
  WindowMaximizeIconIcon,
  WindowMinimizeIconIcon,
  WindowRestoreIconIcon,
  MaximizeIconIcon,
  MinimizeIconIcon,
  MoveIconIcon,
  MoveDiagonalIconIcon,
  MoveDiagonal2IconIcon,
  MoveHorizontalIconIcon,
  MoveVerticalIconIcon,
  ArrowUpIconIcon,
  ArrowDownIconIcon,
  ArrowLeftIconIcon,
  ArrowRightIconIcon,
  ArrowUpDownIconIcon,
  ArrowLeftRightIconIcon,
  CornerUpLeftIconIcon,
  CornerUpRightIconIcon,
  CornerDownLeftIconIcon,
  CornerDownRightIconIcon,
  ChevronsUpIconIcon,
  ChevronsDownIconIcon,
  ChevronsLeftIconIcon,
  ChevronsRightIconIcon,
  ExpandIconIcon,
  ShrinkIconIcon,
  AlignLeftIconIcon,
  AlignCenterIconIcon,
  AlignRightIconIcon,
  AlignJustifyIconIcon,
  IndentIconIcon,
  OutdentIconIcon,
  ListOrderedIconIcon,
  ListUnorderedIconIcon,
  BoldIconIcon,
  ItalicIconIcon,
  UnderlineIconIcon,
  StrikethroughIconIcon,
  QuoteIconIcon,
  CodeIconIcon,
  CodepenIconIcon,
  CodesandboxIconIcon,
  FigmaIconIcon,
  FramerIconIcon,
  PenToolIconIcon,
  PaintbrushIconIcon,
  PaletteIconIcon,
  DropletIconIcon,
  PaintBucketIconIcon,
  BrushIconIcon,
  PencilIconIcon,
  EraserIconIcon,
  ScissorsCuttingIconIcon,
  StampIconIcon,
  Layers2IconIcon,
  Grid2IconIcon,
  Grid3IconIcon,
  ColumnsIconIcon,
  RowsIconIcon,
  TableCellsMergeIconIcon,
  TableCellsSplitIconIcon,
  TablePropertiesIconIcon,
  TableRowsSplitIconIcon,
  TableColumnsSplitIconIcon,
  Table2IconIcon,
  CalendarDaysIconIcon,
  CalendarCheckIconIcon,
  CalendarClockIconIconIcon,
  CalendarMinusIconIcon,
  CalendarPlusIconIcon,
  CalendarRangeIconIcon,
  CalendarSearchIconIcon,
  CalendarXIconIcon,
  Clock1IconIcon,
  Clock2IconIcon,
  Clock3IconIcon,
  Clock4IconIcon,
  Clock5IconIcon,
  Clock6IconIcon,
  Clock7IconIcon,
  Clock8IconIcon,
  Clock9IconIcon,
  Clock10IconIcon,
  Clock11IconIcon,
  Clock12IconIcon,
  AlarmClockIconIcon,
  TimerResetIconIcon,
  StopwatchIconIcon,
  HourglassIconIcon,
  AlarmCheckIconIcon,
  AlarmMinusIconIcon,
  AlarmPlusIconIcon,
  BedIconIcon,
  BedDoubleIconIcon,
  BedSingleIconIcon,
  SofaIconIcon,
  ArmchairIconIcon,
  ChairIconIcon,
  LampTableIconIcon,
  LampFloorIconIconIcon,
  LampWallDownIconIconIcon,
  LampWallUpIconIconIcon,
  LightbulbIconIconIcon,
  LightbulbOffIconIconIcon,
  FlashlightIconIconIcon,
  FlashlightOffIconIconIcon,
  SirenIconIconIcon,
  FanIconIconIcon,
  HeaterIconIconIcon,
  ThermostatIconIconIcon,
  SnowflakeIconIconIcon,
  FlameIconIconIcon,
  MagnetIconIconIcon,
  BatteryIconIconIcon,
  BatteryChargingIconIconIcon,
  BatteryFullIconIconIcon,
  BatteryMediumIconIconIcon,
  BatteryLowIconIconIcon,
  BatteryWarningIconIconIcon,
  PlugIconIconIcon,
  PlugZapIconIconIcon,
  WifiIconIconIcon,
  BluetoothIconIconIcon,
  SignalIconIconIcon,
  EthernetPortIconIcon,
  UsbPortIconIcon,
  CircuitBoardIconIconIcon,
  ChipIconIconIcon,
  CpuIconIconIcon,
  MemoryIconIconIcon,
  HardDriveIconIconIcon,
  DatabaseIconIconIcon,
  ServerIconIconIcon,
  CloudIconIconIcon,
  CloudUploadIconIconIcon,
  CloudDownloadIconIconIcon,
  CloudOffIconIconIcon,
  CloudLightningIconIconIcon,
  CloudRainIconIconIcon,
  CloudSnowIconIconIcon,
  CloudDrizzleIconIconIcon,
  CloudCogIconIconIcon,
  SunIconIconIcon,
  MoonIconIcon,
  SunriseIconIcon,
  SunsetIconIcon,
  ThermometerIconIconIcon,
  ThermometerSunIconIcon,
  ThermometerSnowflakeIconIcon,
  DropletsIconIconIcon,
  WindIconIconIcon,
  ZapIconIconIcon,
  ZapOffIconIcon,
  WavesIconIcon,
  MountainIconIcon,
  MountainSnowIconIcon,
  TreesIconIcon,
  TreePineIconIconIcon,
  TreeDeciduousIconIconIcon,
  FlowerIconIconIcon,
  Flower2IconIconIcon,
  LeafIconIconIcon,
  NutIconIconIcon,
  WheatIconIconIcon,
  AppleIconIconIcon,
  CarrotIconIconIcon,
  EggIconIconIcon,
  FishIconIconIcon,
  BeefIconIconIcon,
  ChickenIconIconIcon,
  PizzaIconIconIcon,
  SandwichIconIconIcon,
  SoupIconIconIcon,
  SaladIconIconIcon,
  IceCreamIconIconIcon,
  CakeIconIconIcon,
  CookieIconIconIconIcon,
  CandyCaneIconIconIcon,
  LollipopIconIconIcon,
  PopcornIconIconIcon,
  CandyCornIconIconIcon,
  HotdogIconIconIcon,
  HamburgerIconIconIcon,
  FrenchFriesIconIconIcon,
  TacoIconIconIcon,
  BurritoIconIconIcon,
  PizzaSliceIconIconIcon,
  SandwichCookieIconIconIcon,
  SoupPotIconIconIcon,
  SaladBowlIconIconIcon,
  IceCreamConeIconIconIcon,
  CakeSliceIconIconIcon,
  CookieJarIconIconIcon,
  CandyStoreIconIconIcon,
  RestaurantIconIconIcon,
  ChefHatIconIconIcon,
  CookingPotIconIconIcon,
  OvenIconIconIcon,
  MicrowaveIconIconIcon,
  RefrigeratorIconIconIcon,
  FreezerIconIconIcon,
  BlenderIconIconIcon,
  ToasterIconIconIcon,
  CoffeeIconIconIcon,
  TeaIconIconIcon,
  JuiceIconIconIcon,
  SodaIconIconIcon,
  WaterBottleIconIconIcon,
  WineGlassIconIconIcon,
  BeerBottleIconIconIcon,
  CocktailIconIconIcon,
  MartiniIconIconIcon,
  WineRackIconIconIcon,
  BeerTapIconIconIcon,
  KettleIconIconIcon,
  MugIconIconIcon,
  GlassIconIconIcon,
  CupIconIconIcon,
  BottleIconIconIcon,
  JarIconIconIcon,
  CanIconIconIcon,
} from "lucide-react";

// Define types
interface ComplianceProfile {
  id: number;
  market: string;
  regulations: string[];
  lastUpdated: string;
  status: "active" | "inactive" | "pending";
  createdBy: string;
}

interface AuditEvent {
  id: number;
  eventType: string;
  timestamp: string;
  user: string;
  details: string;
  hash: string;
  onChain: boolean;
}

interface AutomatedCheck {
  id: number;
  checkName: string;
  productId: number;
  productName: string;
  status: "passed" | "failed" | "pending";
  lastRun: string;
  nextRun: string;
  triggeredBy: string;
}

interface DigitalSignature {
  id: number;
  documentName: string;
  signer: string;
  timestamp: string;
  signature: string;
  verified: boolean;
  documentHash: string;
}

interface TestIntegration {
  id: number;
  labName: string;
  testType: string;
  productId: number;
  productName: string;
  status: "completed" | "pending" | "failed";
  resultLink: string;
  signedReport: string;
  timestamp: string;
}

interface RecallEvent {
  id: number;
  productName: string;
  productId: number;
  reason: string;
  initiatedBy: string;
  timestamp: string;
  affectedProducts: number;
  status: "initiated" | "in-progress" | "completed" | "cancelled";
  notificationsSent: number;
}

const ComplianceManagement = () => {
  console.log("ComplianceManagement component loaded");

  const { isActive } = useWeb3();
  const [activeTab, setActiveTab] = useState("profiles");
  const [userRole, setUserRole] = useState("admin");

  // Compliance Profiles state
  const [profiles, setProfiles] = useState<ComplianceProfile[]>([]);
  const [newProfile, setNewProfile] = useState({
    market: "",
    regulations: [] as string[],
    status: "active" as "active" | "inactive" | "pending",
  });
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null);

  // Audit Trail state
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  // Automated Checks state
  const [automatedChecks, setAutomatedChecks] = useState<AutomatedCheck[]>([]);

  // Digital Signatures state
  const [digitalSignatures, setDigitalSignatures] = useState<
    DigitalSignature[]
  >([]);

  // Testing Integration state
  const [testIntegrations, setTestIntegrations] = useState<TestIntegration[]>(
    []
  );

  // Recall Management state
  const [recallEvents, setRecallEvents] = useState<RecallEvent[]>([]);
  const [newRecall, setNewRecall] = useState({
    productName: "",
    productId: 0,
    reason: "",
    status: "initiated" as
      | "initiated"
      | "in-progress"
      | "completed"
      | "cancelled",
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for demonstration
  useEffect(() => {
    // Compliance Profiles mock data
    const mockProfiles: ComplianceProfile[] = [
      {
        id: 1,
        market: "European Union",
        regulations: ["GDPR", "CE Marking", "REACH"],
        lastUpdated: "2023-11-15",
        status: "active",
        createdBy: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      },
      {
        id: 2,
        market: "United States",
        regulations: ["FDA", "FCC", "OSHA"],
        lastUpdated: "2023-11-20",
        status: "active",
        createdBy: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      },
      {
        id: 3,
        market: "Japan",
        regulations: ["JIS", "PSE", "TELEC"],
        lastUpdated: "2023-11-25",
        status: "pending",
        createdBy: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      },
    ];

    // Audit Trail mock data
    const mockAuditEvents: AuditEvent[] = [
      {
        id: 1,
        eventType: "Product Creation",
        timestamp: "2023-11-15 10:30:00",
        user: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        details: "Created new product Organic Coffee Beans",
        hash: "0x1a2b3c4d5e6f78901234567890abcdef1234567890abcdef1234567890abcdef",
        onChain: true,
      },
      {
        id: 2,
        eventType: "Shipment Assigned",
        timestamp: "2023-11-20 14:15:00",
        user: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        details: "Assigned shipment SHIP-001 to product BATCH-101",
        hash: "0x2b3c4d5e6f78901234567890abcdef1234567890abcdef1234567890abcdef1",
        onChain: true,
      },
      {
        id: 3,
        eventType: "QA Passed",
        timestamp: "2023-11-25 09:45:00",
        user: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        details: "QA test passed for BATCH-101",
        hash: "0x3c4d5e6f78901234567890abcdef1234567890abcdef1234567890abcdef12",
        onChain: true,
      },
      {
        id: 4,
        eventType: "Compliance Check",
        timestamp: "2023-11-30 16:20:00",
        user: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        details: "Completed EU compliance check for BATCH-101",
        hash: "0x4d5e6f78901234567890abcdef1234567890abcdef1234567890abcdef123",
        onChain: false,
      },
    ];

    // Automated Checks mock data
    const mockAutomatedChecks: AutomatedCheck[] = [
      {
        id: 1,
        checkName: "Pre-Shipment QA Validation",
        productId: 101,
        productName: "Organic Coffee Beans",
        status: "passed",
        lastRun: "2023-11-25 09:45:00",
        nextRun: "2023-12-02 09:45:00",
        triggeredBy: "System",
      },
      {
        id: 2,
        checkName: "Regulatory Document Verification",
        productId: 102,
        productName: "Premium Chocolate",
        status: "failed",
        lastRun: "2023-11-28 11:30:00",
        nextRun: "2023-12-05 11:30:00",
        triggeredBy: "Manual Trigger",
      },
      {
        id: 3,
        checkName: "Certificate Expiry Check",
        productId: 103,
        productName: "Organic Honey",
        status: "passed",
        lastRun: "2023-11-30 14:00:00",
        nextRun: "2023-12-07 14:00:00",
        triggeredBy: "Scheduler",
      },
    ];

    // Digital Signatures mock data
    const mockDigitalSignatures: DigitalSignature[] = [
      {
        id: 1,
        documentName: "Organic Certification - BATCH-101",
        signer: "Certifying Authority EU",
        timestamp: "2023-11-15 10:30:00",
        signature:
          "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
        verified: true,
        documentHash:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      },
      {
        id: 2,
        documentName: "Safety Test Report - BATCH-102",
        signer: "Food Safety Labs Inc.",
        timestamp: "2023-11-20 14:15:00",
        signature:
          "0x876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9",
        verified: true,
        documentHash:
          "0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1",
      },
      {
        id: 3,
        documentName: "Export License - BATCH-103",
        signer: "Department of Trade",
        timestamp: "2023-11-25 09:45:00",
        signature:
          "0x76543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba98",
        verified: false,
        documentHash:
          "0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
      },
    ];

    // Testing Integration mock data
    const mockTestIntegrations: TestIntegration[] = [
      {
        id: 1,
        labName: "Eurofins Scientific",
        testType: "Microbiological Analysis",
        productId: 101,
        productName: "Organic Coffee Beans",
        status: "completed",
        resultLink: "#",
        signedReport: "report_101_signed.pdf",
        timestamp: "2023-11-15 10:30:00",
      },
      {
        id: 2,
        labName: "SGS Testing Services",
        testType: "Chemical Contamination",
        productId: 102,
        productName: "Premium Chocolate",
        status: "pending",
        resultLink: "#",
        signedReport: "",
        timestamp: "2023-11-20 14:15:00",
      },
      {
        id: 3,
        labName: "Intertek Group",
        testType: "Nutritional Analysis",
        productId: 103,
        productName: "Organic Honey",
        status: "completed",
        resultLink: "#",
        signedReport: "report_103_signed.pdf",
        timestamp: "2023-11-25 09:45:00",
      },
    ];

    // Recall Management mock data
    const mockRecallEvents: RecallEvent[] = [
      {
        id: 1,
        productName: "Organic Coffee Beans",
        productId: 101,
        reason: "Potential contamination detected in batch",
        initiatedBy: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        timestamp: "2023-11-28 10:00:00",
        affectedProducts: 1250,
        status: "in-progress",
        notificationsSent: 42,
      },
      {
        id: 2,
        productName: "Premium Chocolate",
        productId: 102,
        reason: "Allergen labeling error",
        initiatedBy: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        timestamp: "2023-11-25 14:30:00",
        affectedProducts: 875,
        status: "completed",
        notificationsSent: 68,
      },
    ];

    setProfiles(mockProfiles);
    setAuditEvents(mockAuditEvents);
    setAutomatedChecks(mockAutomatedChecks);
    setDigitalSignatures(mockDigitalSignatures);
    setTestIntegrations(mockTestIntegrations);
    setRecallEvents(mockRecallEvents);
  }, []);

  // Refresh compliance data
  const refreshComplianceData = async () => {
    if (!isActive) {
      console.log("Wallet not connected");
      return;
    }

    try {
      // In a real implementation, you'd fetch actual compliance data from the blockchain
      console.log("Refreshing compliance data...");
    } catch (error) {
      console.error("Error refreshing compliance data:", error);
    }
  };

  // Export compliance data
  const exportComplianceData = () => {
    // In a real app, this would export data to CSV/PDF
    console.log("Exporting compliance data...");
  };

  // Filter functions
  const filteredProfiles = profiles.filter((profile) => {
    return (
      profile.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.regulations.some((reg) =>
        reg.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const filteredAuditEvents = auditEvents.filter((event) => {
    return (
      event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredChecks = automatedChecks.filter((check) => {
    return (
      check.checkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredSignatures = digitalSignatures.filter((signature) => {
    return (
      signature.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signature.signer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredTests = testIntegrations.filter((test) => {
    return (
      test.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredRecalls = recallEvents.filter((recall) => {
    return (
      recall.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recall.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Status badge components
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "passed":
      case "completed":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      case "inactive":
      case "failed":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            <XCircle className="h-4 w-4 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      case "pending":
      case "in-progress":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <Clock className="h-4 w-4 mr-1" />
            {status
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600">
            {status}
          </Badge>
        );
    }
  };

  // Handle profile form changes
  const handleProfileChange = (field: string, value: string | string[]) => {
    setNewProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add new compliance profile
  const addProfile = () => {
    if (newProfile.market.trim() === "" || newProfile.regulations.length === 0)
      return;

    const profile: ComplianceProfile = {
      id: profiles.length + 1,
      market: newProfile.market,
      regulations: [...newProfile.regulations],
      lastUpdated: new Date().toISOString().split("T")[0],
      status: newProfile.status,
      createdBy: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    };

    setProfiles([...profiles, profile]);
    setNewProfile({
      market: "",
      regulations: [],
      status: "active",
    });
  };

  // Start editing a profile
  const startEditingProfile = (profile: ComplianceProfile) => {
    setEditingProfileId(profile.id);
    setNewProfile({
      market: profile.market,
      regulations: [...profile.regulations],
      status: profile.status,
    });
  };

  // Save edited profile
  const saveEditedProfile = () => {
    if (editingProfileId === null) return;

    setProfiles(
      profiles.map((profile) =>
        profile.id === editingProfileId
          ? {
              ...profile,
              market: newProfile.market,
              regulations: [...newProfile.regulations],
              status: newProfile.status,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : profile
      )
    );

    setEditingProfileId(null);
    setNewProfile({
      market: "",
      regulations: [],
      status: "active",
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingProfileId(null);
    setNewProfile({
      market: "",
      regulations: [],
      status: "active",
    });
  };

  // Delete a profile
  const deleteProfile = (id: number) => {
    setProfiles(profiles.filter((profile) => profile.id !== id));
  };

  // Handle regulation input (comma separated)
  const handleRegulationInput = (value: string) => {
    const regulations = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    handleProfileChange("regulations", regulations);
  };

  // Add new recall event
  const addRecall = () => {
    if (newRecall.productName.trim() === "" || newRecall.reason.trim() === "")
      return;

    const recall: RecallEvent = {
      id: recallEvents.length + 1,
      productName: newRecall.productName,
      productId: newRecall.productId,
      reason: newRecall.reason,
      initiatedBy: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      affectedProducts: Math.floor(Math.random() * 1000) + 100,
      status: newRecall.status,
      notificationsSent: 0,
    };

    setRecallEvents([...recallEvents, recall]);
    setNewRecall({
      productName: "",
      productId: 0,
      reason: "",
      status: "initiated",
    });
  };

  // Update recall status
  const updateRecallStatus = (id: number, status: RecallEvent["status"]) => {
    setRecallEvents(
      recallEvents.map((recall) =>
        recall.id === id ? { ...recall, status } : recall
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Compliance Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage regulatory compliance, audit trails, and recall procedures
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="transporter">Transporter</option>
            <option value="retailer">Retailer</option>
            <option value="consumer">Consumer</option>
          </select>
          <Button
            onClick={refreshComplianceData}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportComplianceData}
            className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Wallet connection warning */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <Shield className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect to interact with blockchain
              features
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200">
        <button
          onClick={() => setActiveTab("profiles")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "profiles"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Compliance Profiles
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "audit"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Gavel className="h-4 w-4 inline mr-2" />
          Audit Trail
        </button>
        <button
          onClick={() => setActiveTab("checks")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "checks"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Shield className="h-4 w-4 inline mr-2" />
          Automated Checks
        </button>
        <button
          onClick={() => setActiveTab("signatures")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "signatures"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileSignature className="h-4 w-4 inline mr-2" />
          Digital Signatures
        </button>
        <button
          onClick={() => setActiveTab("testing")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "testing"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <TestTube className="h-4 w-4 inline mr-2" />
          Testing Integration
        </button>
        <button
          onClick={() => setActiveTab("recall")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "recall"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <AlertTriangle className="h-4 w-4 inline mr-2" />
          Recall Management
        </button>
      </div>

      {/* Search and Filter Section */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Search className="h-5 w-5 mr-2 text-blue-500" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="text-gray-700">
                Search
              </Label>
              <div className="relative mt-1">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search compliance data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-700">
                Filter by Status
              </Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Profiles Tab */}
      {activeTab === "profiles" && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Plus className="h-5 w-5 mr-2 text-blue-500" />
                Add/Edit Compliance Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="market" className="text-gray-700">
                    Market
                  </Label>
                  <Input
                    id="market"
                    type="text"
                    placeholder="Enter market (e.g., European Union)"
                    value={newProfile.market}
                    onChange={(e) =>
                      handleProfileChange("market", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="regulations" className="text-gray-700">
                    Regulations (comma separated)
                  </Label>
                  <Input
                    id="regulations"
                    type="text"
                    placeholder="Enter regulations (e.g., GDPR, CE Marking)"
                    value={newProfile.regulations.join(", ")}
                    onChange={(e) => handleRegulationInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-status" className="text-gray-700">
                    Status
                  </Label>
                  <select
                    id="profile-status"
                    value={newProfile.status}
                    onChange={(e) =>
                      handleProfileChange("status", e.target.value)
                    }
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="flex items-end space-x-2">
                  {editingProfileId ? (
                    <>
                      <Button
                        onClick={saveEditedProfile}
                        className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        variant="outline"
                        className="flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={addProfile}
                      className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <ClipboardList className="h-5 w-5 mr-2 text-blue-500" />
                Compliance Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-gray-700 font-bold">
                        Market
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Regulations
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Last Updated
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Status
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.length > 0 ? (
                      filteredProfiles.map((profile) => (
                        <TableRow key={profile.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {profile.market}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {profile.regulations.map((reg, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {reg}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{profile.lastUpdated}</TableCell>
                          <TableCell>
                            {getStatusBadge(profile.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => startEditingProfile(profile)}
                                variant="outline"
                                size="sm"
                                className="flex items-center"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                onClick={() => deleteProfile(profile.id)}
                                variant="outline"
                                size="sm"
                                className="flex items-center text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-gray-500"
                        >
                          No compliance profiles found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === "audit" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Database className="h-5 w-5 mr-2 text-blue-500" />
              Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-700 font-bold">
                      Event Type
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Timestamp
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      User
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Details
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Hash
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      On-Chain
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditEvents.length > 0 ? (
                    filteredAuditEvents.map((event) => (
                      <TableRow key={event.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {event.eventType}
                        </TableCell>
                        <TableCell>{event.timestamp}</TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {event.user.substring(0, 6)}...
                            {event.user.substring(event.user.length - 4)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {event.details}
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs truncate max-w-[120px]">
                            {event.hash.substring(0, 10)}...
                            {event.hash.substring(event.hash.length - 8)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.onChain ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              <X className="h-3 w-3 mr-1" />
                              No
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No audit events found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automated Checks Tab */}
      {activeTab === "checks" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Shield className="h-5 w-5 mr-2 text-blue-500" />
              Automated Compliance Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-700 font-bold">
                      Check Name
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Product
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Status
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Last Run
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Next Run
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Triggered By
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChecks.length > 0 ? (
                    filteredChecks.map((check) => (
                      <TableRow key={check.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {check.checkName}
                        </TableCell>
                        <TableCell>{check.productName}</TableCell>
                        <TableCell>{getStatusBadge(check.status)}</TableCell>
                        <TableCell>{check.lastRun}</TableCell>
                        <TableCell>{check.nextRun}</TableCell>
                        <TableCell>{check.triggeredBy}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No automated checks found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Digital Signatures Tab */}
      {activeTab === "signatures" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <FileSignature className="h-5 w-5 mr-2 text-blue-500" />
              Digital Signatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-700 font-bold">
                      Document
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Signer
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Timestamp
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Signature
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Verified
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSignatures.length > 0 ? (
                    filteredSignatures.map((signature) => (
                      <TableRow key={signature.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {signature.documentName}
                        </TableCell>
                        <TableCell>{signature.signer}</TableCell>
                        <TableCell>{signature.timestamp}</TableCell>
                        <TableCell>
                          <div className="font-mono text-xs truncate max-w-[120px]">
                            {signature.signature.substring(0, 10)}...
                            {signature.signature.substring(
                              signature.signature.length - 8
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {signature.verified ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <X className="h-3 w-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No digital signatures found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testing Integration Tab */}
      {activeTab === "testing" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <TestTube className="h-5 w-5 mr-2 text-blue-500" />
              Third-Party Testing Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-700 font-bold">
                      Lab Name
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Test Type
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Product
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Status
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Timestamp
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                      <TableRow key={test.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {test.labName}
                        </TableCell>
                        <TableCell>{test.testType}</TableCell>
                        <TableCell>{test.productName}</TableCell>
                        <TableCell>{getStatusBadge(test.status)}</TableCell>
                        <TableCell>{test.timestamp}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Results
                            </Button>
                            {test.signedReport && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Report
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No testing integrations found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recall Management Tab */}
      {activeTab === "recall" && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <AlertTriangle className="h-5 w-5 mr-2 text-blue-500" />
                Initiate Product Recall
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-name" className="text-gray-700">
                    Product Name
                  </Label>
                  <Input
                    id="product-name"
                    type="text"
                    placeholder="Enter product name"
                    value={newRecall.productName}
                    onChange={(e) =>
                      setNewRecall({
                        ...newRecall,
                        productName: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="product-id" className="text-gray-700">
                    Product ID
                  </Label>
                  <Input
                    id="product-id"
                    type="number"
                    placeholder="Enter product ID"
                    value={newRecall.productId || ""}
                    onChange={(e) =>
                      setNewRecall({
                        ...newRecall,
                        productId: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="recall-reason" className="text-gray-700">
                    Recall Reason
                  </Label>
                  <Input
                    id="recall-reason"
                    type="text"
                    placeholder="Enter reason for recall"
                    value={newRecall.reason}
                    onChange={(e) =>
                      setNewRecall({ ...newRecall, reason: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="recall-status" className="text-gray-700">
                    Initial Status
                  </Label>
                  <select
                    id="recall-status"
                    value={newRecall.status}
                    onChange={(e) =>
                      setNewRecall({
                        ...newRecall,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="initiated">Initiated</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={addRecall}
                    className="flex items-center bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Initiate Recall
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Flag className="h-5 w-5 mr-2 text-blue-500" />
                Active Recalls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-gray-700 font-bold">
                        Product
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Reason
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Initiated
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Affected
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Status
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Notifications
                      </TableHead>
                      <TableHead className="text-gray-700 font-bold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecalls.length > 0 ? (
                      filteredRecalls.map((recall) => (
                        <TableRow key={recall.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {recall.productName}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {recall.reason}
                          </TableCell>
                          <TableCell>{recall.timestamp}</TableCell>
                          <TableCell>{recall.affectedProducts}</TableCell>
                          <TableCell>{getStatusBadge(recall.status)}</TableCell>
                          <TableCell>{recall.notificationsSent}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() =>
                                  updateRecallStatus(recall.id, "in-progress")
                                }
                                disabled={
                                  recall.status === "in-progress" ||
                                  recall.status === "completed" ||
                                  recall.status === "cancelled"
                                }
                                variant="outline"
                                size="sm"
                                className="flex items-center"
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                              <Button
                                onClick={() =>
                                  updateRecallStatus(recall.id, "completed")
                                }
                                disabled={
                                  recall.status === "completed" ||
                                  recall.status === "cancelled"
                                }
                                variant="outline"
                                size="sm"
                                className="flex items-center"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                              <Button
                                onClick={() =>
                                  updateRecallStatus(recall.id, "cancelled")
                                }
                                disabled={
                                  recall.status === "completed" ||
                                  recall.status === "cancelled"
                                }
                                variant="outline"
                                size="sm"
                                className="flex items-center text-red-600 hover:text-red-800"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          No recall events found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ComplianceManagement;
