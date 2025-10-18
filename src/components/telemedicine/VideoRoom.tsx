import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Monitor,
  MonitorOff,
  Settings,
  Users,
  MessageSquare,
  Share2,
  Download,
  Play,
  Pause,
  Square,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVideoCallManager } from '@/lib/webrtc/VideoCallManager';
import { getMediaDeviceManager } from '@/lib/webrtc/MediaDeviceManager';
import { getScreenShareManager } from '@/lib/webrtc/ScreenShareManager';
import { getRecordingManager } from '@/lib/webrtc/RecordingManager';
import { getConnectionQuality } from '@/lib/webrtc/ConnectionQuality';

export default function VideoRoom({
  sessionId,
  patientId,
  patientName,
  onSessionEnd,
  showChat = true,
  showScreenShare = true,
  showRecording = true
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareRef = useRef(null);

  const callManager = useRef(null);
  const deviceManager = useRef(null);
  const screenShareManager = useRef(null);
  const recordingManager = useRef(null);
  const connectionQualityMonitor = useRef(null);

  useEffect(() => {
    initializeVideoRoom();
    return () => cleanup();
  }, []);

  const initializeVideoRoom = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Check for required permissions
      const hasCameraPermission = await checkCameraPermission();
      const hasMicrophonePermission = await checkMicrophonePermission();

      if (!hasCameraPermission) {
        throw new Error('Camera permission is required for video calls');
      }

      if (!hasMicrophonePermission) {
        throw new Error('Microphone permission is required for video calls');
      }

      // Initialize managers
      callManager.current = getVideoCallManager();
      deviceManager.current = getMediaDeviceManager();
      screenShareManager.current = getScreenShareManager();
      recordingManager.current = getRecordingManager();
      connectionQualityMonitor.current = getConnectionQuality();

      // Initialize device manager
      await deviceManager.current.initialize();

      // Get local media stream
      const localStream = await deviceManager.current.getMediaStream();

      // Set up local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      // Set up event listeners
      setupEventListeners();

      // Start connection (this would typically be initiated by the provider)
      // For now, we'll simulate a connection
      setIsConnected(true);

    } catch (error) {
      console.error('Failed to initialize video room:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize video room');
    } finally {
      setIsInitializing(false);
    }
  };

  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      return hasCamera;
    } catch {
      return false;
    }
  };

  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');
      return hasMicrophone;
    } catch {
      return false;
    }
  };

  const setupEventListeners = () => {
    // Call manager events
    callManager.current.on('remoteStream', handleRemoteStream);
    callManager.current.on('callEnded', handleCallEnded);
    callManager.current.on('error', handleError);

    // Screen share events
    screenShareManager.current.on('screenShareStarted', handleScreenShareStarted);
    screenShareManager.current.on('screenShareStopped', handleScreenShareStopped);

    // Recording events
    recordingManager.current.on('recordingStarted', handleRecordingStarted);
    recordingManager.current.on('recordingStopped', handleRecordingStopped);

    // Connection quality events
    connectionQualityMonitor.current.on('statsUpdated', handleStatsUpdated);
  };

  const handleRemoteStream = ({ peerId, stream }) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  };

  const handleCallEnded = ({ peerId }) => {
    setIsConnected(false);
    onSessionEnd?.();
  };

  const handleError = (error: any) => {
    console.error('Video room error:', error);
  };

  const handleScreenShareStarted = ({ stream }) => {
    setIsScreenSharing(true);
    if (screenShareRef.current) {
      screenShareRef.current.srcObject = stream;
    }
  };

  const handleScreenShareStopped = () => {
    setIsScreenSharing(false);
    if (screenShareRef.current) {
      screenShareRef.current.srcObject = null;
    }
  };

  const handleRecordingStarted = () => {
    setIsRecording(true);
  };

  const handleRecordingStopped = () => {
    setIsRecording(false);
  };

  const handleStatsUpdated = ({ peerId, quality }) => {
    setConnectionQuality(quality);
  };

  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        screenShareManager.current.stopScreenShare();
      } else {
        await screenShareManager.current.startScreenShare();
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        recordingManager.current.stopRecording();
      } else {
        const streams = [localVideoRef.current?.srcObject, remoteVideoRef.current?.srcObject].filter(Boolean);
        await recordingManager.current.startRecording(streams);
      }
    } catch (error) {
      console.error('Failed to toggle recording:', error);
    }
  };

  const endCall = () => {
    callManager.current.endCall();
    setIsConnected(false);
    onSessionEnd?.();
  };

  const cleanup = () => {
    if (callManager.current) {
      callManager.current.destroy();
    }
    if (deviceManager.current) {
      deviceManager.current.destroy();
    }
    if (screenShareManager.current) {
      screenShareManager.current.destroy();
    }
    if (recordingManager.current) {
      recordingManager.current.destroy();
    }
    if (connectionQualityMonitor.current) {
      connectionQualityMonitor.current.destroy();
    }
  };

  const getQualityColor = (quality: any) => {
    const colors = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500',
      fair: 'bg-yellow-500',
      poor: 'bg-red-500',
      unknown: 'bg-gray-500'
    };
    return colors[quality] || colors.unknown;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Telemedicine Session</h2>
          <Badge variant="outline" className="text-white border-gray-600">
            {patientName}
          </Badge>
          <div className={cn("w-2 h-2 rounded-full", getQualityColor(connectionQuality))} />
          <span className="text-sm text-gray-300 capitalize">{connectionQuality}</span>
        </div>

        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-sm">Recording</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <div className="absolute inset-0 bg-black">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Screen Share Overlay */}
          {isScreenSharing && (
            <div className="absolute top-4 right-4 w-1/3 h-1/3 bg-black rounded-lg overflow-hidden border-2 border-blue-500">
              <video
                ref={screenShareRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoOn && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Connection Status */}
        {!isConnected && !error && isInitializing && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-white">Connecting...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <VideoOff className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Failed</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={initializeVideoRoom} variant="default">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                  <Button onClick={() => onSessionEnd?.()} variant="outline">
                    End Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-800 border-t border-gray-700">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="lg"
          onClick={toggleMute}
          className="rounded-full w-12 h-12"
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>

        <Button
          variant={!isVideoOn ? "destructive" : "secondary"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12"
        >
          {!isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </Button>

        {showScreenShare && (
          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-full w-12 h-12"
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Button>
        )}

        {showChat && (
          <Button
            variant={showChatPanel ? "default" : "secondary"}
            size="lg"
            onClick={() => setShowChatPanel(!showChatPanel)}
            className="rounded-full w-12 h-12"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        )}

        {showRecording && (
          <Button
            variant={isRecording ? "destructive" : "secondary"}
            size="lg"
            onClick={toggleRecording}
            className="rounded-full w-12 h-12"
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        )}

        <Button
          variant="destructive"
          size="lg"
          onClick={endCall}
          className="rounded-full w-12 h-12"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>

      {/* Chat Panel */}
      {showChatPanel && (
        <div className="absolute right-0 top-0 w-80 h-full bg-gray-800 border-l border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold">Chat</h3>
          </div>
          <div className="flex-1 p-4">
            <p className="text-gray-400 text-sm">Chat functionality will be implemented in the next phase.</p>
          </div>
        </div>
      )}
    </div>
  );
}
