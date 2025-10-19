// Staff Messages System Component
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Video, 
  Phone, 
  Send,
  Paperclip,
  Users,
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Download,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { mockApiClient } from "@/api/mockApiClient";

// Mock WebRTC implementation (replace with real WebRTC library)
class MockWebRTC {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.isConnected = false;
  }

  async startCall(type = 'video') {
    console.log(`Starting ${type} call...`);
    // Mock implementation - replace with real WebRTC
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        resolve({ success: true, type });
      }, 1000);
    });
  }

  async endCall() {
    console.log('Ending call...');
    this.isConnected = false;
    return { success: true };
  }

  async sendMessage(message) {
    console.log('Sending message:', message);
    return { success: true, message };
  }
}

export default function StaffMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState('video');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  
  const webrtcRef = useRef(new MockWebRTC());
  const messagesEndRef = useRef(null);

  // Fetch staff messages
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['staff-messages'],
    queryFn: () => mockApiClient.entities.StaffMessage.list(),
  });

  // Fetch users for messaging
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => mockApiClient.entities.User.list(),
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return mockApiClient.entities.StaffMessage.create(messageData);
    },
    onSuccess: (newMessage: any) => {
      setMessages(prev => [...prev, newMessage]);
      setNewMessage('');
    }
  });

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  useEffect(() => {
    if (usersData) {
      setUsers(usersData.filter(u => u.id !== user?.id)); // Exclude current user
    }
  }, [usersData, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      sender_id: user?.id,
      recipient_id: selectedUser.id,
      message_type: 'text',
      content: newMessage.trim(),
      attachments: attachments,
      call_data: {},
      read_at: null
    };

    sendMessageMutation.mutate(messageData);
  };

  const handleStartCall = async (type) => {
    if (!selectedUser) return;

    try {
      setCallType(type);
      const result = await webrtcRef.current.startCall(type);
      if (result.success) {
        setIsCallActive(true);
        
        // Create call message
        const callMessage = {
          sender_id: user?.id,
          recipient_id: selectedUser.id,
          message_type: 'call',
          content: `${type} call started`,
          call_data: {
            type: type,
            duration: 0,
            status: 'active'
          },
          attachments: [],
          read_at: null
        };

        await mockApiClient.entities.StaffMessage.create(callMessage);
        refetchMessages();
      }
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const handleEndCall = async () => {
    try {
      const result = await webrtcRef.current.endCall();
      if (result.success) {
        setIsCallActive(false);
        
        // Create call end message
        const callMessage = {
          sender_id: user?.id,
          recipient_id: selectedUser.id,
          message_type: 'call',
          content: `${callType} call ended`,
          call_data: {
            type: callType,
            duration: 0,
            status: 'ended'
          },
          attachments: [],
          read_at: null
        };

        await mockApiClient.entities.StaffMessage.create(callMessage);
        refetchMessages();
      }
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      try {
        // Upload file using Base44
        const uploadResult = await mockApiClient.integrations.Core.UploadFile(file);
        
        const attachment = {
          name: file.name,
          type: file.type,
          size: file.size,
          url: uploadResult.file_url
        };
        
        setAttachments(prev => [...prev, attachment]);
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  };

  const handleRemoveAttachment = (index: any) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || message.message_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getMessageIcon = (messageType: any) => {
    switch (messageType) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'voice':
        return <Phone className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageStatus = (message: any) => {
    if (message.read_at) {
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const formatMessageTime = (timestamp: any) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserName = (userId: any) => {
    const userData = users.find(u => u.id === userId);
    return userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown User';
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                Staff Messages
              </h1>
              <p className="text-sm text-gray-600">
                Communicate with staff members via text, voice, and video calls
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={refetchMessages} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {usersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : (
                  users.map((userData: any) => (
                    <div
                      key={userData.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.id === userData.id 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedUser(userData)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {userData.firstName} {userData.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {userData.role} • {userData.organization}
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedUser ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                          </span>
                        </div>
                        {selectedUser.firstName} {selectedUser.lastName}
                      </>
                    ) : (
                      'Select a staff member to start messaging'
                    )}
                  </CardTitle>
                  {selectedUser && (
                    <CardDescription>
                      {selectedUser.role} • Online
                    </CardDescription>
                  )}
                </div>
                
                {selectedUser && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartCall('video')}
                      disabled={isCallActive}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartCall('voice')}
                      disabled={isCallActive}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {selectedUser ? (
                <div className="space-y-4">
                  {/* Call Controls */}
                  {isCallActive && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {callType} Call Active
                          </Badge>
                          <span className="text-sm text-gray-600">00:00</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                          >
                            {isVideoEnabled ? <Camera className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                          >
                            {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleEndCall}
                          >
                            <PhoneOff className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="h-96 overflow-y-auto space-y-3 p-4 border rounded-lg">
                    {messagesLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))
                    ) : (
                      filteredMessages
                        .filter(msg => 
                          (msg.sender_id === user?.id && msg.recipient_id === selectedUser.id) ||
                          (msg.sender_id === selectedUser.id && msg.recipient_id === user?.id)
                        )
                        .map((message: any) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs p-3 rounded-lg ${
                              message.sender_id === user?.id 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-900'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                {getMessageIcon(message.message_type)}
                                <span className="text-xs">
                                  {getUserName(message.sender_id)}
                                </span>
                              </div>
                              <div className="text-sm">{message.content}</div>
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map((attachment, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs">
                                      <Paperclip className="h-3 w-3" />
                                      <a 
                                        href={attachment.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="underline"
                                      >
                                        {attachment.name}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs opacity-75">
                                  {formatMessageTime(message.created_at)}
                                </span>
                                {getMessageStatus(message)}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="space-y-3">
                    {/* Attachments */}
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-sm">{attachment.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Input Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAttachmentDialog(true)}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a staff member to start messaging</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* File Upload Dialog */}
        <Dialog open={showAttachmentDialog} onOpenChange={setShowAttachmentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{"Attach Files"}</DialogTitle>
              <DialogDescription>
                Upload PDF documents or images to share with staff
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select Files</Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>
              
              {attachments.length > 0 && (
                <div>
                  <Label>{"Attached Files"}</Label>
                  <div className="mt-2 space-y-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm">{attachment.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAttachmentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAttachmentDialog(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>{"Staff Messaging Features"}</CardTitle>
            <CardDescription>
              Communication tools for healthcare staff collaboration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Communication Features</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Real-time text messaging between staff members</li>
                  <li>• Video calling for face-to-face communication</li>
                  <li>• Voice calling for quick consultations</li>
                  <li>• File attachments (PDF, images) for document sharing</li>
                  <li>• Message status indicators (sent, delivered, read)</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Best Practices</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Use video calls for complex discussions and consultations</li>
                  <li>• Share relevant documents and images for better context</li>
                  <li>• Keep messages professional and patient-focused</li>
                  <li>• Use voice calls for urgent matters requiring immediate attention</li>
                  <li>• Ensure all communications comply with HIPAA guidelines</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
