import React from 'react';
import {
    // Navigation & Layout
    LayoutDashboard, Users, Calendar, Stethoscope, Pill, Beaker, Activity, Video,
    FileText, DollarSign, BarChart3, ArrowUpRightSquare, ClipboardList, TestTube,
    Settings, HelpCircle, Bell, Search, Filter, MoreHorizontal, ChevronDown,
    ChevronUp, ChevronLeft, ChevronRight, Home, Menu, X, Plus, Minus,

    // Medical & Healthcare
    HeartPulse, Syringe, Scissors, UserCog, FileHeart, FileSignature, Calculator,
    Shield, AlertTriangle, CheckCircle, XCircle, PauseCircle, PlayCircle,
    Clock, Timer, CalendarDays, CalendarCheck, CalendarX, CalendarPlus,

    // Patient & User Management
    User, UserPlus, UserCheck, UserX, UserCog2, UserSearch,
    Phone, Mail, MapPin, Globe, Building2, Hospital, Ambulance,

    // Data & Information
    Database, Download, Upload, Share2, Copy, Edit, Trash2, Save, RefreshCw,
    Eye, EyeOff, Lock, Unlock, Key, Fingerprint, ShieldCheck,

    // Status & Actions
    Star, StarOff, Bookmark, BookmarkCheck, Flag, FlagOff, Target, Zap,
    TrendingUp, TrendingDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    RotateCcw, RotateCw, Maximize2, Minimize2, Move, GripVertical,

    // Communication & Notifications
    MessageCircle, MessageSquare, Send, Reply, Forward, Archive,
    Volume2, VolumeX, Mic, MicOff, Headphones, Camera, CameraOff,

    // Forms & Input
    Check, CheckSquare, Square, Circle, CircleCheck, CircleX,
    Radio, ToggleLeft, ToggleRight,

    // Files & Documents
    File, FileImage, FileVideo, FileAudio, FileSpreadsheet,
    FileCode, FileArchive, Folder, FolderOpen, FolderPlus, FolderMinus,

    // Charts & Analytics
    PieChart, LineChart, BarChart,

    // Time & Scheduling
    Hourglass, Sunrise, Sunset,

    // Technology & Devices
    Monitor, Smartphone, Tablet, Laptop, Server, Wifi, Bluetooth,
    Battery, BatteryLow, Plug, Power, Cpu, HardDrive, MemoryStick,

    // Business & Finance
    CreditCard, Wallet, Receipt, Euro, PoundSterling,

    // Lab & Testing
    Microscope, FlaskConical, TestTube2, Droplets, Thermometer,
    Scale, Ruler, Compass, Map, Navigation, Route,

    // Emergency & Alerts
    AlertCircle, AlertOctagon, Siren, Megaphone, PhoneCall, PhoneOff, PhoneIncoming,

    // Accessibility & Support
    Accessibility,

    // Workflow & Process
    Workflow, GitBranch, GitCommit, GitMerge, GitPullRequest,
    ArrowUpDown, ArrowLeftRight, ArrowUpLeft, ArrowUpRight,
    ArrowDownLeft, ArrowDownRight,

    // Specialized Medical
    Heart, Brain, Bone, Ear,

    // Equipment & Tools
    Wrench, Hammer, Drill, Triangle,

    // Weather & Environment
    Wind,

    // Transportation
    Car, Truck, Bus, Train, Plane, Ship, Bike,

    // Food & Nutrition
    Apple, Banana, Carrot, Fish, Egg, Milk,
    Coffee, Wine, Beer, Utensils, UtensilsCrossed,

    // Sports & Fitness
    Dumbbell,
    Volleyball,

    // Entertainment & Media
    Play, Pause, SkipBack, SkipForward,

    // Travel & Tourism
    Luggage, Hotel
} from 'lucide-react';

// Icon System Component
export default function IconSystem() {
    // Core Navigation Icons
    const navigationIcons = {
        dashboard: LayoutDashboard,
        patients: Users,
        appointments: Calendar,
        telemedicine: Video,
        labOrders: TestTube,
        labManagement: Beaker,
        prescriptions: Pill,
        pharmacy: Pill,
        referrals: ArrowUpRightSquare,
        reports: ClipboardList,
        billing: DollarSign,
        analytics: BarChart3,
        templates: FileText,
        documents: FileText,
        settings: Settings,
        help: HelpCircle,
        notifications: Bell,
        search: Search,
        filter: Filter,
        more: MoreHorizontal,
        chevronDown: ChevronDown,
        chevronUp: ChevronUp,
        chevronLeft: ChevronLeft,
        chevronRight: ChevronRight,
        home: Home,
        menu: Menu,
        close: X,
        add: Plus,
        remove: Minus
    };

    // Medical & Healthcare Icons
    const medicalIcons = {
        stethoscope: Stethoscope,
        heart: HeartPulse,
        syringe: Syringe,
        scissors: Scissors,
        userCog: UserCog,
        fileHeart: FileHeart,
        fileSignature: FileSignature,
        calculator: Calculator,
        shield: Shield,
        alertTriangle: AlertTriangle,
        checkCircle: CheckCircle,
        xCircle: XCircle,
        pauseCircle: PauseCircle,
        playCircle: PlayCircle,
        clock: Clock,
        timer: Timer,
        calendarDays: CalendarDays,
        calendarCheck: CalendarCheck,
        calendarX: CalendarX,
        calendarPlus: CalendarPlus
    };

    // Patient & User Management Icons
    const userIcons = {
        user: User,
        userPlus: UserPlus,
        userCheck: UserCheck,
        userX: UserX,
        userCog2: UserCog2,
        userSearch: UserSearch,
        userEdit: UserEdit,
        phone: Phone,
        mail: Mail,
        mapPin: MapPin,
        globe: Globe,
        building2: Building2,
        hospital: Hospital,
        ambulance: Ambulance
    };

    // Data & Information Icons
    const dataIcons = {
        database: Database,
        download: Download,
        upload: Upload,
        share2: Share2,
        copy: Copy,
        edit: Edit,
        trash2: Trash2,
        save: Save,
        refreshCw: RefreshCw,
        eye: Eye,
        eyeOff: EyeOff,
        lock: Lock,
        unlock: Unlock,
        key: Key,
        fingerprint: Fingerprint,
        shieldCheck: ShieldCheck
    };

    // Status & Actions Icons
    const statusIcons = {
        star: Star,
        starOff: StarOff,
        bookmark: Bookmark,
        bookmarkCheck: BookmarkCheck,
        flag: Flag,
        flagOff: FlagOff,
        target: Target,
        zap: Zap,
        trendingUp: TrendingUp,
        trendingDown: TrendingDown,
        arrowUp: ArrowUp,
        arrowDown: ArrowDown,
        arrowLeft: ArrowLeft,
        arrowRight: ArrowRight,
        rotateCcw: RotateCcw,
        rotateCw: RotateCw,
        maximize2: Maximize2,
        minimize2: Minimize2,
        move: Move,
        gripVertical: GripVertical
    };

    // Communication & Notifications Icons
    const communicationIcons = {
        messageCircle: MessageCircle,
        messageSquare: MessageSquare,
        send: Send,
        reply: Reply,
        forward: Forward,
        archive: Archive,
        volume2: Volume2,
        volumeX: VolumeX,
        mic: Mic,
        micOff: MicOff,
        headphones: Headphones,
        camera: Camera,
        cameraOff: CameraOff
    };

    // Forms & Input Icons
    const formIcons = {
        check: Check,
        checkSquare: CheckSquare,
        square: Square,
        circle: Circle,
        circleCheck: CircleCheck,
        circleX: CircleX,
        radio: Radio,
        toggleLeft: ToggleLeft,
        toggleRight: ToggleRight,
        slider: Slider,
        toggle: Toggle
    };

    // Files & Documents Icons
    const fileIcons = {
        file: File,
        fileImage: FileImage,
        fileVideo: FileVideo,
        fileAudio: FileAudio,
        filePdf: FilePdf,
        fileSpreadsheet: FileSpreadsheet,
        fileCode: FileCode,
        fileArchive: FileArchive,
        folder: Folder,
        folderOpen: FolderOpen,
        folderPlus: FolderPlus,
        folderMinus: FolderMinus
    };

    // Charts & Analytics Icons
    const chartIcons = {
        pieChart: PieChart,
        lineChart: LineChart,
        barChart: BarChart,
        trendingUp: TrendingUp,
        activity: Activity,
        target: Target
    };

    // Time & Scheduling Icons
    const timeIcons = {
        clock: Clock,
        timer: Timer,
        stopwatch: Stopwatch,
        hourglass: Hourglass,
        sunrise: Sunrise,
        sunset: Sunset
    };

    // Security & Privacy Icons
    const securityIcons = {
        lock: Lock,
        unlock: Unlock,
        shield: Shield,
        eye: Eye,
        eyeOff: EyeOff,
        key: Key,
        fingerprint: Fingerprint,
        shieldCheck: ShieldCheck
    };

    // Technology & Devices Icons
    const techIcons = {
        monitor: Monitor,
        smartphone: Smartphone,
        tablet: Tablet,
        laptop: Laptop,
        desktop: Desktop,
        server: Server,
        wifi: Wifi,
        bluetooth: Bluetooth,
        battery: Battery,
        batteryLow: BatteryLow,
        plug: Plug,
        power: Power,
        cpu: Cpu,
        hardDrive: HardDrive,
        memoryStick: MemoryStick
    };

    // Business & Finance Icons
    const financeIcons = {
        creditCard: CreditCard,
        wallet: Wallet,
        receipt: Receipt,
        calculator: Calculator,
        trendingUp: TrendingUp,
        trendingDown: TrendingDown,
        dollarSign: DollarSign,
        euro: Euro,
        poundSterling: PoundSterling,
        yen: Yen
    };

    // Lab & Testing Icons
    const labIcons = {
        microscope: Microscope,
        flaskConical: FlaskConical,
        testTube2: TestTube2,
        droplets: Droplets,
        thermometer: Thermometer,
        scale: Scale,
        ruler: Ruler,
        compass: Compass,
        map: Map,
        navigation: Navigation,
        route: Route
    };

    // Emergency & Alerts Icons
    const emergencyIcons = {
        alertCircle: AlertCircle,
        alertOctagon: AlertOctagon,
        siren: Siren,
        megaphone: Megaphone,
        phoneCall: PhoneCall,
        phoneOff: PhoneOff,
        phoneIncoming: PhoneIncoming
    };

    // Accessibility & Support Icons
    const accessibilityIcons = {
        accessibility: Accessibility,
        braille: Braille,
        volume2: Volume2,
        volumeX: VolumeX,
        headphones: Headphones,
        eye: Eye
    };

    // Workflow & Process Icons
    const workflowIcons = {
        workflow: Workflow,
        gitBranch: GitBranch,
        gitCommit: GitCommit,
        gitMerge: GitMerge,
        gitPullRequest: GitPullRequest,
        arrowUpDown: ArrowUpDown,
        arrowLeftRight: ArrowLeftRight,
        arrowUpLeft: ArrowUpLeft,
        arrowUpRight: ArrowUpRight,
        arrowDownLeft: ArrowDownLeft,
        arrowDownRight: ArrowDownRight
    };

    // Specialized Medical Icons
    const specializedMedicalIcons = {
        pill: Pill,
        syringe: Syringe,
        stethoscope: Stethoscope,
        heart: Heart,
        brain: Brain,
        bone: Bone,
        tooth: Tooth,
        eye: Eye,
        ear: Ear,
        nose: Nose,
        lungs: Lungs,
        liver: Liver,
        kidney: Kidney,
        stomach: Stomach,
        intestine: Intestine
    };

    // Equipment & Tools Icons
    const equipmentIcons = {
        wrench: Wrench,
        hammer: Hammer,
        screwdriver: Screwdriver,
        drill: Drill,
        saw: Saw,
        level: Level,
        ruler: Ruler,
        compass: Compass,
        protractor: Protractor,
        triangle: Triangle
    };

    // Weather & Environment Icons
    const weatherIcons = {
        sun: Sunrise,
        moon: Sunset,
        cloud: Cloud,
        cloudRain: CloudRain,
        cloudSnow: CloudSnow,
        wind: Wind,
        thermometer: Thermometer,
        droplets: Droplets
    };

    // Transportation Icons
    const transportIcons = {
        car: Car,
        truck: Truck,
        bus: Bus,
        train: Train,
        plane: Plane,
        ship: Ship,
        bike: Bike,
        motorcycle: Motorcycle,
        navigation: Navigation,
        map: Map
    };

    // Food & Nutrition Icons
    const foodIcons = {
        apple: Apple,
        banana: Banana,
        carrot: Carrot,
        broccoli: Broccoli,
        fish: Fish,
        meat: Meat,
        egg: Egg,
        milk: Milk,
        coffee: Coffee,
        tea: Tea,
        water: Water,
        wine: Wine,
        beer: Beer,
        utensils: Utensils,
        utensilsCrossed: UtensilsCrossed
    };

    // Sports & Fitness Icons
    const sportsIcons = {
        dumbbell: Dumbbell,
        running: Running,
        swimming: Swimming,
        cycling: Cycling,
        hiking: Hiking,
        skiing: Skiing,
        snowboarding: Snowboarding,
        tennis: Tennis,
        basketball: Basketball,
        football: Football,
        soccer: Soccer,
        baseball: Baseball,
        golf: Golf,
        volleyball: Volleyball
    };

    // Entertainment & Media Icons
    const mediaIcons = {
        play: Play,
        pause: Pause,
        stop: Stop,
        skipBack: SkipBack,
        skipForward: SkipForward,
        volume2: Volume2
    };

    // Travel & Tourism Icons
    const travelIcons = {
        luggage: Luggage,
        passport: Passport,
        plane: Plane,
        hotel: Hotel,
        restaurant: Restaurant,
        mapPin: MapPin,
        compass: Compass,
        camera: Camera
    };

    // Social & Communication Icons
    const socialIcons = {
        messageCircle: MessageCircle,
        heart: Heart
    };

    // Return all icon categories
    return {
        navigation: navigationIcons,
        medical: medicalIcons,
        user: userIcons,
        data: dataIcons,
        status: statusIcons,
        communication: communicationIcons,
        form: formIcons,
        file: fileIcons,
        chart: chartIcons,
        time: timeIcons,
        security: securityIcons,
        tech: techIcons,
        finance: financeIcons,
        lab: labIcons,
        emergency: emergencyIcons,
        accessibility: accessibilityIcons,
        workflow: workflowIcons,
        specializedMedical: specializedMedicalIcons,
        equipment: equipmentIcons,
        weather: weatherIcons,
        transport: transportIcons,
        food: foodIcons,
        sports: sportsIcons,
        media: mediaIcons,
        travel: travelIcons,
        social: socialIcons
    };
}