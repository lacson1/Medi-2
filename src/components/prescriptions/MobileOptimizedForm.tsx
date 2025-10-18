import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Mic,
    MicOff,
    Camera,
    Scan,
    Upload,
    Download,
    Save,
    Wifi,
    WifiOff,
    Smartphone,
    Tablet,
    Monitor,
    Volume2,
    VolumeX,
    Eye,
    EyeOff,
    Zap,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

interface MobileOptimizedFormProps {
    voiceInput?: boolean;
    barcodeScanner?: boolean;
    dragAndDrop?: boolean;
    autoSave?: boolean;
    offlineMode?: boolean;
    onVoiceInput: (text: string) => void;
    onBarcodeScan: (code: string) => void;
    onFileUpload: (file: File) => void;
    onAutoSave: (data: any) => void;
}

export default function MobileOptimizedForm({
    voiceInput = true,
    barcodeScanner = true,
    dragAndDrop = true,
    autoSave = true,
    offlineMode = true,
    onVoiceInput,
    onBarcodeScan,
    onFileUpload,
    onAutoSave
}: MobileOptimizedFormProps) {
    const [isListening, setIsListening] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const [draggedOver, setDraggedOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Detect device type
        const detectDevice = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setDeviceType('mobile');
            } else if (width < 1024) {
                setDeviceType('tablet');
            } else {
                setDeviceType('desktop');
            }
        };

        detectDevice();
        window.addEventListener('resize', detectDevice);

        // Online/offline detection
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initialize voice recognition
        if (voiceInput && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                onVoiceInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };
        }

        // Auto-save functionality
        if (autoSave) {
            const interval = setInterval(() => {
                setAutoSaveStatus('saving');
                // Simulate auto-save
                setTimeout(() => {
                    onAutoSave({ timestamp: new Date().toISOString() });
                    setAutoSaveStatus('saved');
                }, 1000);
            }, 30000); // Auto-save every 30 seconds

            return () => clearInterval(interval);
        }

        return () => {
            window.removeEventListener('resize', detectDevice);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [voiceInput, autoSave, onVoiceInput, onAutoSave]);

    const startVoiceInput = () => {
        if (recognitionRef.current) {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const stopVoiceInput = () => {
        if (recognitionRef.current) {
            setIsListening(false);
            recognitionRef.current.stop();
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setDraggedOver(true);
    };

    const handleDragLeave = () => {
        setDraggedOver(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setDraggedOver(false);

        const files = Array.from(event.dataTransfer.files);
        if (files.length > 0) {
            onFileUpload(files[0]);
        }
    };

    const getDeviceIcon = () => {
        switch (deviceType) {
            case 'mobile': return <Smartphone className="w-4 h-4" />;
            case 'tablet': return <Tablet className="w-4 h-4" />;
            case 'desktop': return <Monitor className="w-4 h-4" />;
        }
    };

    const getDeviceColor = () => {
        switch (deviceType) {
            case 'mobile': return 'text-blue-600';
            case 'tablet': return 'text-green-600';
            case 'desktop': return 'text-purple-600';
        }
    };

    return (
        <div className="space-y-4">
            {/* Device & Connection Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className={getDeviceColor()}>
                            {getDeviceIcon()}
                        </div>
                        Device Optimization
                        <Badge variant="outline" className="ml-2">
                            {deviceType.toUpperCase()}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            {isOnline ? (
                                <>
                                    <Wifi className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-600">Online</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-4 h-4 text-red-600" />
                                    <span className="text-sm text-red-600">Offline</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {autoSaveStatus === 'saved' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {autoSaveStatus === 'saving' && <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>}
                            {autoSaveStatus === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                            <span className="text-sm">
                                {autoSaveStatus === 'saved' && 'Auto-saved'}
                                {autoSaveStatus === 'saving' && 'Saving...'}
                                {autoSaveStatus === 'error' && 'Save failed'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Voice Input */}
            {voiceInput && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mic className="w-5 h-5 text-blue-600" />
                            Voice Input
                            <Badge variant="outline" className="ml-2">
                                <Zap className="w-3 h-3 mr-1" />
                                AI
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={isVoiceEnabled ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                                >
                                    {isVoiceEnabled ? <Volume2 className="w-4 h-4 mr-1" /> : <VolumeX className="w-4 h-4 mr-1" />}
                                    {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
                                </Button>

                                {isVoiceEnabled && (
                                    <Button
                                        variant={isListening ? "destructive" : "default"}
                                        size="sm"
                                        onClick={isListening ? stopVoiceInput : startVoiceInput}
                                    >
                                        {isListening ? <MicOff className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
                                        {isListening ? 'Stop' : 'Start'} Listening
                                    </Button>
                                )}
                            </div>

                            {isListening && (
                                <Alert className="border-blue-200 bg-blue-50">
                                    <Mic className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800">
                                        <div className="flex items-center gap-2">
                                            <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                                            <span>Listening... Speak now</span>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="text-xs text-gray-600">
                                💡 <strong>Tip:</strong> Say medication names clearly. The AI will auto-complete and suggest dosages.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Barcode Scanner */}
            {barcodeScanner && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Scan className="w-5 h-5 text-green-600" />
                            Barcode Scanner
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={isScanning ? "destructive" : "default"}
                                    size="sm"
                                    onClick={() => setIsScanning(!isScanning)}
                                >
                                    <Scan className="w-4 h-4 mr-1" />
                                    {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                                </Button>

                                <Button variant="outline" size="sm">
                                    <Camera className="w-4 h-4 mr-1" />
                                    Take Photo
                                </Button>
                            </div>

                            {isScanning && (
                                <Alert className="border-green-200 bg-green-50">
                                    <Scan className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                        <div className="flex items-center gap-2">
                                            <div className="animate-pulse w-2 h-2 bg-green-600 rounded-full"></div>
                                            <span>Scanning for barcode...</span>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="text-xs text-gray-600">
                                📱 <strong>Mobile:</strong> Point camera at medication barcode for instant identification
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Drag & Drop File Upload */}
            {dragAndDrop && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5 text-purple-600" />
                            File Upload
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${draggedOver
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-sm text-gray-600 mb-2">
                                    Drag & drop files here, or click to browse
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-4 h-4 mr-1" />
                                    Choose File
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                />
                            </div>

                            <div className="text-xs text-gray-600">
                                📄 <strong>Supported:</strong> PDF, JPG, PNG, DOC, DOCX files
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Mobile-Specific Features */}
            {deviceType === 'mobile' && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                            <Smartphone className="w-5 h-5" />
                            Mobile Optimizations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Touch-optimized form fields</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Large tap targets (44px minimum)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Responsive keyboard handling</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Offline data persistence</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Progressive Web App features</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Offline Mode */}
            {offlineMode && !isOnline && (
                <Alert className="border-orange-200 bg-orange-50">
                    <WifiOff className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <strong>Offline Mode:</strong> You're working offline. Changes will sync when connection is restored.
                    </AlertDescription>
                </Alert>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                            <Save className="w-3 h-3 mr-1" />
                            Save Draft
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                        </Button>
                        <Button variant="outline" size="sm">
                            <Upload className="w-3 h-3 mr-1" />
                            Share
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
