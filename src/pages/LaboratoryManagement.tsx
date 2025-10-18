import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockApiClient } from "@/api/mockApiClient";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Beaker, 
  Package, 
  Settings, 
  Shield, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  Wrench,
  Zap,
  AlertCircle
} from 'lucide-react';
import LabInventoryManager from '@/components/labs/LabInventoryManager';
import EquipmentManager from '@/components/labs/EquipmentManager';
import QualityControl from '@/components/labs/QualityControl';

export default function LaboratoryManagement() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch lab orders for metrics calculation
  const { data: labOrders } = useQuery({
    queryKey: ['labOrders'],
    queryFn: () => mockApiClient.entities.LabOrder.list(),
  });

  // Calculate lab management metrics
  const labMetrics = React.useMemo(() => {
    if (!labOrders) return {};
    
    const totalOrders = labOrders.length;
    const completedOrders = labOrders.filter(order => order.status === 'completed').length;
    const pendingOrders = labOrders.filter(order => order.status === 'pending').length;
    const urgentOrders = labOrders.filter(order => order.priority === 'urgent' || order.priority === 'stat').length;
    
    // Mock equipment metrics
    const totalEquipment = 15;
    const operationalEquipment = 12;
    const maintenanceEquipment = 2;
    const outOfOrderEquipment = 1;
    
    // Mock inventory metrics
    const totalInventoryItems = 45;
    const lowStockItems = 8;
    const outOfStockItems = 2;
    const expiringSoonItems = 5;
    
    // Mock QC metrics
    const totalQCTests = 28;
    const passedQCTests = 25;
    const failedQCTests = 2;
    const pendingQCTests = 1;

    return {
      // Order metrics
      totalOrders,
      completedOrders,
      pendingOrders,
      urgentOrders,
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      
      // Equipment metrics
      totalEquipment,
      operationalEquipment,
      maintenanceEquipment,
      outOfOrderEquipment,
      equipmentUtilization: totalEquipment > 0 ? Math.round((operationalEquipment / totalEquipment) * 100) : 0,
      
      // Inventory metrics
      totalInventoryItems,
      lowStockItems,
      outOfStockItems,
      expiringSoonItems,
      inventoryHealth: totalInventoryItems > 0 ? Math.round(((totalInventoryItems - outOfStockItems - lowStockItems) / totalInventoryItems) * 100) : 0,
      
      // QC metrics
      totalQCTests,
      passedQCTests,
      failedQCTests,
      pendingQCTests,
      qcPassRate: totalQCTests > 0 ? Math.round((passedQCTests / totalQCTests) * 100) : 0
    };
  }, [labOrders]);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Beaker className="w-8 h-8 text-blue-600" />
              Laboratory Management
            </h1>
            <p className="text-gray-600 mt-1">Manage laboratory operations, equipment, inventory, and quality control</p>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Lab Operations */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lab Operations</p>
                  <p className="text-2xl font-bold text-blue-600">{labMetrics.completionRate}%</p>
                  <p className="text-xs text-gray-500">Completion Rate</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Equipment Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Equipment</p>
                  <p className="text-2xl font-bold text-green-600">{labMetrics.equipmentUtilization}%</p>
                  <p className="text-xs text-gray-500">Operational</p>
                </div>
                <Settings className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Inventory Health */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory</p>
                  <p className="text-2xl font-bold text-purple-600">{labMetrics.inventoryHealth}%</p>
                  <p className="text-xs text-gray-500">Health Score</p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* Quality Control */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quality Control</p>
                  <p className="text-2xl font-bold text-indigo-600">{labMetrics.qcPassRate}%</p>
                  <p className="text-xs text-gray-500">Pass Rate</p>
                </div>
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Equipment Status Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Equipment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Operational</span>
                </div>
                <span className="font-medium">{labMetrics.operationalEquipment}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Maintenance</span>
                </div>
                <span className="font-medium">{labMetrics.maintenanceEquipment}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Out of Order</span>
                </div>
                <span className="font-medium">{labMetrics.outOfOrderEquipment}</span>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Inventory Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Out of Stock</span>
                </div>
                <Badge className="bg-red-100 text-red-800">{labMetrics.outOfStockItems}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Low Stock</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">{labMetrics.lowStockItems}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Expiring Soon</span>
                </div>
                <Badge className="bg-orange-100 text-orange-800">{labMetrics.expiringSoonItems}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* QC Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                QC Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Passed</span>
                </div>
                <span className="font-medium text-green-600">{labMetrics.passedQCTests}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Failed</span>
                </div>
                <span className="font-medium text-red-600">{labMetrics.failedQCTests}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="font-medium text-yellow-600">{labMetrics.pendingQCTests}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {labMetrics.outOfStockItems > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Inventory Alert</span>
            </div>
            <p className="text-red-700 mt-1">
              {labMetrics.outOfStockItems} items are out of stock and need immediate restocking.
            </p>
          </div>
        )}

        {labMetrics.failedQCTests > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Quality Control Alert</span>
            </div>
            <p className="text-red-700 mt-1">
              {labMetrics.failedQCTests} QC tests have failed and require immediate attention.
            </p>
          </div>
        )}

        {labMetrics.outOfOrderEquipment > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Equipment Alert</span>
            </div>
            <p className="text-yellow-700 mt-1">
              {labMetrics.outOfOrderEquipment} equipment items are out of order and need maintenance.
            </p>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="quality">Quality Control</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lab Operations Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Lab Operations Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{labMetrics.totalOrders}</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{labMetrics.completedOrders}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{labMetrics.pendingOrders}</p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{labMetrics.urgentOrders}</p>
                      <p className="text-sm text-gray-600">Urgent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    Check Inventory Levels
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Schedule Equipment Maintenance
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Run Quality Control Tests
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Lab Reports
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">QC Test Completed</p>
                      <p className="text-sm text-gray-600">Glucose control test passed - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Inventory Updated</p>
                      <p className="text-sm text-gray-600">Blood collection tubes restocked - 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Settings className="w-5 h-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium">Equipment Maintenance</p>
                      <p className="text-sm text-gray-600">Microscope calibration completed - 6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <LabInventoryManager />
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment">
            <EquipmentManager />
          </TabsContent>

          {/* Quality Control Tab */}
          <TabsContent value="quality">
            <QualityControl labOrders={labOrders} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
