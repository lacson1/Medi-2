import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
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
  Phone,
  PhoneOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VideoControls({ 
  isMuted,
  isVideoOn,
  isScreenSharing,
  isRecording,
  connectionQuality,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onEndCall,
  onOpenSettings,
  onOpenParticipants,
  onOpenChat,
  showScreenShare = true,
  showRecording = true,
  showChat = true,
  className
}) {
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

  const getQualityIcon = (quality: any) => {
    const icons = {
      excellent: '🟢',
      good: '🔵',
      fair: '🟡',
      poor: '🔴',
      unknown: '⚪'
    };
    return icons[quality] || icons.unknown;
  };

  return (
    <div className={cn("flex items-center justify-between p-4 bg-gray-800 border-t border-gray-700", className)}>
      {/* Left side - Connection info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", getQualityColor(connectionQuality))} />
          <span className="text-sm text-gray-300 capitalize">{connectionQuality}</span>
        </div>
        
        {isRecording && (
          <div className="flex items-center gap-2 text-red-400">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-sm">Recording</span>
          </div>
        )}
      </div>

      {/* Center - Main controls */}
      <div className="flex items-center gap-4">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="lg"
          onClick={onToggleMute}
          className="rounded-full w-12 h-12"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>

        <Button
          variant={!isVideoOn ? "destructive" : "secondary"}
          size="lg"
          onClick={onToggleVideo}
          className="rounded-full w-12 h-12"
          title={!isVideoOn ? "Turn on camera" : "Turn off camera"}
        >
          {!isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </Button>

        {showScreenShare && (
          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="lg"
            onClick={onToggleScreenShare}
            className="rounded-full w-12 h-12"
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Button>
        )}

        {showChat && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onOpenChat}
            className="rounded-full w-12 h-12"
            title="Open chat"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        )}

        {showRecording && (
          <Button
            variant={isRecording ? "destructive" : "secondary"}
            size="lg"
            onClick={onToggleRecording}
            className="rounded-full w-12 h-12"
            title={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        )}

        <Button
          variant="destructive"
          size="lg"
          onClick={onEndCall}
          className="rounded-full w-12 h-12"
          title="End call"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>

      {/* Right side - Additional controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenParticipants}
          className="text-gray-300 hover:text-white"
          title="Participants"
        >
          <Users className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          className="text-gray-300 hover:text-white"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
