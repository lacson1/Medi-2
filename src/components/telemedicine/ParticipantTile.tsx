import React, { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Crown,
  User,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ParticipantTile({ 
  participant,
  isLocal = false,
  isMainView = false,
  onToggleMute,
  onToggleVideo,
  onMakeMain,
  onRemove,
  showControls = true,
  className
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const getRoleIcon = (role: any) => {
    switch (role) {
      case 'provider':
      case 'doctor':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: any) => {
    switch (role) {
      case 'provider':
      case 'doctor':
        return 'bg-yellow-100 text-yellow-800';
      case 'patient':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn(
      "relative bg-gray-800 rounded-lg overflow-hidden border-2 transition-all duration-200",
      isMainView ? "border-blue-500" : "border-gray-600",
      isLocal ? "border-green-500" : "",
      className
    )}>
      {/* Video Element */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
        
        {/* Video Off Overlay */}
        {!participant.isVideoOn && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <VideoOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{participant.name}</p>
            </div>
          </div>
        )}

        {/* Connection Quality Indicator */}
        {participant.connectionQuality && (
          <div className="absolute top-2 left-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              participant.connectionQuality === 'excellent' && "bg-green-500",
              participant.connectionQuality === 'good' && "bg-blue-500",
              participant.connectionQuality === 'fair' && "bg-yellow-500",
              participant.connectionQuality === 'poor' && "bg-red-500"
            )} />
          </div>
        )}

        {/* Local Indicator */}
        {isLocal && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              You
            </Badge>
          </div>
        )}

        {/* Role Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge className={cn("text-xs", getRoleColor(participant.role))}>
            <div className="flex items-center gap-1">
              {getRoleIcon(participant.role)}
              <span className="capitalize">{participant.role}</span>
            </div>
          </Badge>
        </div>

        {/* Audio Status */}
        <div className="absolute bottom-2 right-2">
          <div className={cn(
            "p-1 rounded-full",
            participant.isMuted ? "bg-red-500" : "bg-green-500"
          )}>
            {participant.isMuted ? (
              <MicOff className="w-3 h-3 text-white" />
            ) : (
              <Mic className="w-3 h-3 text-white" />
            )}
          </div>
        </div>
      </div>

      {/* Participant Info Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-white truncate">
              {participant.name}
            </h4>
            {participant.isSpeaking && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          
          {showControls && !isLocal && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleMute?.(participant.id)}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                {participant.isMuted ? (
                  <MicOff className="w-3 h-3" />
                ) : (
                  <Mic className="w-3 h-3" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleVideo?.(participant.id)}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                {!participant.isVideoOn ? (
                  <VideoOff className="w-3 h-3" />
                ) : (
                  <Video className="w-3 h-3" />
                )}
              </Button>

              {!isMainView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMakeMain?.(participant.id)}
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  title="Make main view"
                >
                  <Crown className="w-3 h-3" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Speaking Indicator */}
      {participant.isSpeaking && (
        <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse" />
      )}
    </div>
  );
}
