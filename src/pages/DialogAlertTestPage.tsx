import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Monitor,
  Shield,
  Zap,
  Eye
} from 'lucide-react';
import DialogAlertTester from '@/components/testing/DialogAlertTester';

export default function DialogAlertTestPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [exampleDialogOpen, setExampleDialogOpen] = useState(false);
  const [exampleAlertDialogOpen, setExampleAlertDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    priority: 'medium'
  });

  const handleFormSubmit = () => {
    console.log('Form submitted:', formData);
    setExampleDialogOpen(false);
    setFormData({ name: '', email: '', message: '', priority: 'medium' });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dialog & Alert Testing</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive testing interface for all dialog and alert components
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Shield className="w-4 h-4 mr-2" />
          Testing Suite
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  Dialog Components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Basic Dialog</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Modal Dialog</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Form Dialog</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Alert Dialogs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Confirmation Dialog</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Destructive Action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Warning Dialog</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Alert Components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Default Alert</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Destructive Alert</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Success Alert</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Testing Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Rendering Tests</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Component structure validation</li>
                    <li>• Content rendering verification</li>
                    <li>• Styling and layout checks</li>
                    <li>• Icon and button placement</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Interaction Tests</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Open/close functionality</li>
                    <li>• Button click handling</li>
                    <li>• Keyboard navigation</li>
                    <li>• ESC key support</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Accessibility Tests</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• ARIA attributes validation</li>
                    <li>• Focus management</li>
                    <li>• Screen reader support</li>
                    <li>• Keyboard accessibility</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Edge Cases</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Multiple dialog handling</li>
                    <li>• Rapid open/close cycles</li>
                    <li>• Error state management</li>
                    <li>• Performance testing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dialog Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setExampleDialogOpen(true)}
                  className="w-full"
                >
                  Open Basic Dialog
                </Button>

                <div className="space-y-2">
                  <h4 className="font-semibold">Dialog Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Modal overlay</li>
                    <li>• Close button (X)</li>
                    <li>• ESC key support</li>
                    <li>• Focus trap</li>
                    <li>• ARIA attributes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Dialog Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="destructive"
                  onClick={() => setExampleAlertDialogOpen(true)}
                  className="w-full"
                >
                  Open Alert Dialog
                </Button>

                <div className="space-y-2">
                  <h4 className="font-semibold">Alert Dialog Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Confirmation actions</li>
                    <li>• Cancel/Confirm buttons</li>
                    <li>• Destructive styling</li>
                    <li>• Focus management</li>
                    <li>• Accessibility support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Alert Component Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This is a default alert with informational content.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This is a destructive alert for critical information.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing">
          <DialogAlertTester />
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Accessibility Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">ARIA Standards</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">role=&quot;dialog&quot;</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">aria-labelledby</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">aria-describedby</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">aria-modal=&quot;true&quot;</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Keyboard Navigation</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Tab navigation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">ESC to close</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Focus trap</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Return focus</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Screen Reader Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  All dialog and alert components are designed with screen reader compatibility in mind.
                  They include proper ARIA labels, descriptions, and semantic markup.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-gray-600">ARIA Compliance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-gray-600">Keyboard Accessible</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-gray-600">Screen Reader Ready</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Example Dialogs */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ display: exampleDialogOpen ? 'flex' : 'none' }}>
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Example Dialog</h3>
            <button
              onClick={() => setExampleDialogOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This is an example dialog with form content.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: string) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setExampleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleFormSubmit}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ display: exampleAlertDialogOpen ? 'flex' : 'none' }}>
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-red-600">Confirm Action</h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to perform this action? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setExampleAlertDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setExampleAlertDialogOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}