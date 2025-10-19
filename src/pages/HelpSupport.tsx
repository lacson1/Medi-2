// Help & Support System Component
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  HelpCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  BookOpen,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Calendar,
  Tag,
  Send,
  RefreshCw
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { mockApiClient } from "@/api/mockApiClient";
import { toast } from 'sonner';

export default function HelpSupportPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('faqs');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({});
  const [supportRequest, setSupportRequest] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });

  const isSuperAdmin = user?.role === 'admin' && user?.email === 'superadmin@mediflow.com';
  const isDelegate = user?.role === 'delegate';

  // Fetch FAQs
  const { data: faqs, isLoading: faqsLoading, refetch: refetchFaqs } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => mockApiClient.entities.FAQ.list(),
  });

  // Fetch Guides
  const { data: guides, isLoading: guidesLoading, refetch: refetchGuides } = useQuery({
    queryKey: ['guides'],
    queryFn: () => mockApiClient.entities.Guide.list(),
  });

  // Fetch Resources
  const { data: resources, isLoading: resourcesLoading, refetch: refetchResources } = useQuery({
    queryKey: ['resources'],
    queryFn: () => mockApiClient.entities.Resource.list(),
  });

  // Fetch Support Tickets
  const { data: supportTickets, isLoading: ticketsLoading, refetch: refetchTickets } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => mockApiClient.entities.SupportTicket.list(),
  });

  // Create FAQ mutation
  const createFaqMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.entities.FAQ.create(data),
    onSuccess: () => {
      refetchFaqs();
      setShowAddDialog(false);
      setNewItem({});
      toast.success('FAQ added successfully');
    },
    onError: () => {
      toast.error('Failed to add FAQ');
    }
  });

  // Create Guide mutation
  const createGuideMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.entities.Guide.create(data),
    onSuccess: () => {
      refetchGuides();
      setShowAddDialog(false);
      setNewItem({});
      toast.success('Guide added successfully');
    },
    onError: () => {
      toast.error('Failed to add Guide');
    }
  });

  // Create Resource mutation
  const createResourceMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.entities.Resource.create(data),
    onSuccess: () => {
      refetchResources();
      setShowAddDialog(false);
      setNewItem({});
      toast.success('Resource added successfully');
    },
    onError: () => {
      toast.error('Failed to add Resource');
    }
  });

  // Create Support Ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.entities.SupportTicket.create(data),
    onSuccess: () => {
      refetchTickets();
      setSupportRequest({ subject: '', description: '', priority: 'medium', category: 'general' });
      toast.success('Support ticket created successfully');
    },
    onError: () => {
      toast.error('Failed to create support ticket');
    }
  });

  const handleAddItem = () => {
    if (activeTab === 'faqs') {
      createFaqMutation.mutate(newItem);
    } else if (activeTab === 'guides') {
      createGuideMutation.mutate(newItem);
    } else if (activeTab === 'resources') {
      createResourceMutation.mutate(newItem);
    }
  };

  const handleSubmitSupportRequest = () => {
    const ticketData = {
      ...supportRequest,
      user_id: user?.id,
      status: 'open',
      ticket_number: `TICKET-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    createTicketMutation.mutate(ticketData);
  };

  const filteredFaqs = faqs?.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredGuides = guides?.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredResources = resources?.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getPriorityColor = (priority: any) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-blue-600" />
              Help & Support
            </h1>
            <p className="text-sm text-gray-600">
              Find answers, guides, and get help when you need it
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => window.open('tel:+1-800-MEDIFLOW')} variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call Support
            </Button>
            <Button onClick={() => window.open('mailto:support@mediflow.com')} variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Email Support
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search FAQs, guides, and resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">FAQs</span>
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Guides</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Tickets</span>
            </TabsTrigger>
          </TabsList>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
              {(isSuperAdmin || isDelegate) && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {faqsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))
              ) : filteredFaqs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No FAQs found matching your search</p>
                  </CardContent>
                </Card>
              ) : (
                filteredFaqs.map((faq: any) => (
                  <Card key={faq.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{faq.answer}</p>
                      <div className="flex items-center gap-2 mt-4">
                        <Badge variant="outline">{faq.category}</Badge>
                        <span className="text-sm text-gray-500">
                          Last updated: {new Date(faq.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Guides</h2>
              {(isSuperAdmin || isDelegate) && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Guide
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guidesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))
              ) : filteredGuides.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No guides found matching your search</p>
                  </CardContent>
                </Card>
              ) : (
                filteredGuides.map((guide: any) => (
                  <Card key={guide.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">{guide.content}</p>
                      <div className="flex items-center justify-between mt-4">
                        <Badge variant="outline">{guide.category}</Badge>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Read More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Contact Support Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Support Request Form */}
              <Card>
                <CardHeader>
                  <CardTitle>{"Submit Support Request"}</CardTitle>
                  <CardDescription>
                    Describe your issue and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{"Subject"}</Label>
                    <Input
                      value={supportRequest.subject}
                      onChange={(e) => setSupportRequest({ ...supportRequest, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{"Category"}</Label>
                    <Select
                      value={supportRequest.category}
                      onValueChange={(value) => setSupportRequest({ ...supportRequest, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{"Priority"}</Label>
                    <Select
                      value={supportRequest.priority}
                      onValueChange={(value) => setSupportRequest({ ...supportRequest, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{"Description"}</Label>
                    <Textarea
                      value={supportRequest.description}
                      onChange={(e) => setSupportRequest({ ...supportRequest, description: e.target.value })}
                      placeholder="Please provide detailed information about your issue..."
                      rows={6}
                    />
                  </div>

                  <Button
                    onClick={handleSubmitSupportRequest}
                    disabled={createTicketMutation.isPending}
                    className="w-full"
                  >
                    {createTicketMutation.isPending ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" /> Submit Request</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{"Contact Information"}</CardTitle>
                  <CardDescription>
                    Get in touch with our support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">Phone Support</p>
                        <p className="text-sm text-gray-600">1-800-MEDIFLOW</p>
                        <p className="text-xs text-gray-500">Mon-Fri 8AM-6PM EST</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                      <Mail className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold">Email Support</p>
                        <p className="text-sm text-gray-600">support@mediflow.com</p>
                        <p className="text-xs text-gray-500">Response within 24 hours</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-semibold">Live Chat</p>
                        <p className="text-sm text-gray-600">Available 24/7</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Start Chat
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Emergency Support</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      For critical issues affecting patient care:
                    </p>
                    <Button variant="destructive" size="sm" className="w-full">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Emergency Hotline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Resources</h2>
              {(isSuperAdmin || isDelegate) && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resourcesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))
              ) : filteredResources.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No resources found matching your search</p>
                  </CardContent>
                </Card>
              ) : (
                filteredResources.map((resource: any) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{resource.type}</Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Support Tickets</h2>
              <Button onClick={() => setActiveTab('contact')}>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>

            <div className="space-y-4">
              {ticketsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              ) : supportTickets?.filter(ticket => ticket.user_id === user?.id).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No support tickets found</p>
                    <Button onClick={() => setActiveTab('contact')} className="mt-4">
                      Create Your First Ticket
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                supportTickets
                  ?.filter(ticket => ticket.user_id === user?.id)
                  .map((ticket: any) => (
                    <Card key={ticket.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{ticket.subject}</h3>
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Ticket #{ticket.ticket_number}</span>
                              <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                              <span>Category: {ticket.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Item Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Add {activeTab === 'faqs' ? 'FAQ' : activeTab === 'guides' ? 'Guide' : 'Resource'}
              </DialogTitle>
              <DialogDescription>
                Create a new {activeTab === 'faqs' ? 'FAQ' : activeTab === 'guides' ? 'guide' : 'resource'} for users
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {activeTab === 'faqs' && (
                <>
                  <div className="space-y-2">
                    <Label>{"Question"}</Label>
                    <Input
                      value={newItem.question || ''}
                      onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
                      placeholder="Enter the question"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{"Answer"}</Label>
                    <Textarea
                      value={newItem.answer || ''}
                      onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
                      placeholder="Enter the answer"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{"Category"}</Label>
                    <Input
                      value={newItem.category || ''}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      placeholder="Enter category"
                    />
                  </div>
                </>
              )}

              {(activeTab === 'guides' || activeTab === 'resources') && (
                <>
                  <div className="space-y-2">
                    <Label>{"Title"}</Label>
                    <Input
                      value={newItem.title || ''}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder="Enter title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{"Description"}</Label>
                    <Textarea
                      value={newItem.description || ''}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                  {activeTab === 'guides' && (
                    <div className="space-y-2">
                      <Label>{"Content"}</Label>
                      <Textarea
                        value={newItem.content || ''}
                        onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                        placeholder="Enter guide content"
                        rows={6}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{"Category"}</Label>
                    <Input
                      value={newItem.category || ''}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      placeholder="Enter category"
                    />
                  </div>
                  {activeTab === 'resources' && (
                    <div className="space-y-2">
                      <Label>{"Type"}</Label>
                      <Input
                        value={newItem.type || ''}
                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                        placeholder="Enter resource type"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem}>
                Add {activeTab === 'faqs' ? 'FAQ' : activeTab === 'guides' ? 'Guide' : 'Resource'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
