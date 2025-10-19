import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  Download,
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, differenceInDays, isAfter, isBefore } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const REPORT_TYPES = {
  daily: { label: 'Daily Report', color: 'bg-blue-100 text-blue-800' },
  weekly: { label: 'Weekly Report', color: 'bg-green-100 text-green-800' },
  monthly: { label: 'Monthly Report', color: 'bg-purple-100 text-purple-800' },
  quarterly: { label: 'Quarterly Report', color: 'bg-orange-100 text-orange-800' },
  annual: { label: 'Annual Report', color: 'bg-red-100 text-red-800' },
  custom: { label: 'Custom Report', color: 'bg-gray-100 text-gray-800' }
};

export default function LabReports({ labOrders = [] }: any) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReportType, setSelectedReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  // Generate mock report data based on lab orders
  const generateReportData = () => {
    const startDate = parseISO(dateRange.start);
    const endDate = parseISO(dateRange.end);

    const filteredOrders = labOrders.filter(order => {
      // Use the correct field name and add null safety
      const orderDateString = order.order_date || order.date_ordered;
      if (!orderDateString) return false;

      try {
        const orderDate = parseISO(orderDateString);
        return isAfter(orderDate, startDate) && isBefore(orderDate, endDate);
      } catch (error) {
        console.warn('Invalid date format for lab order:', order.id, orderDateString);
        return false;
      }
    });

    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(order => order.status === 'completed').length;
    const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
    const urgentOrders = filteredOrders.filter(order => order.priority === 'urgent').length;
    const statOrders = filteredOrders.filter(order => order.priority === 'stat').length;

    // Calculate turnaround times (mock data)
    const avgTurnaroundTime = totalOrders > 0 ? Math.round(Math.random() * 4 + 2) : 0; // 2-6 hours
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    // Generate test type breakdown
    const testTypes = {};
    filteredOrders.forEach(order => {
      const testType = order.test_name.split(' ')[0]; // Simple categorization
      testTypes[testType] = (testTypes[testType] || 0) + 1;
    });

    // Generate daily trends
    const dailyTrends = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOrders = filteredOrders.filter(order => {
        const orderDateString = order.order_date || order.date_ordered;
        if (!orderDateString) return false;

        try {
          const orderDate = parseISO(orderDateString);
          return orderDate.toDateString() === currentDate.toDateString();
        } catch (error) {
          console.warn('Invalid date format for lab order:', order.id, orderDateString);
          return false;
        }
      });

      dailyTrends.push({
        date: format(currentDate, 'MMM d'),
        orders: dayOrders.length,
        completed: dayOrders.filter(o => o.status === 'completed').length
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      urgentOrders,
      statOrders,
      avgTurnaroundTime,
      completionRate,
      testTypes,
      dailyTrends
    };
  };

  const reportData = generateReportData();

  const handleExportReport = (format: any) => {
    // Mock export functionality
    console.log(`Exporting ${selectedReportType} report as ${format}`);
    // In real implementation, this would generate and download the report
  };

  const handlePrintReport = () => {
    // Mock print functionality
    console.log(`Printing ${selectedReportType} report`);
    // In real implementation, this would open print dialog
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Laboratory Reports & Analytics
              </CardTitle>
              <p className="text-gray-600 mt-1">Comprehensive reporting and analytics for laboratory operations</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handlePrintReport()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => handleExportReport('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPORT_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalOrders}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{reportData.completedOrders}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{reportData.completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Turnaround</p>
                <p className="text-2xl font-bold text-orange-600">{reportData.avgTurnaroundTime}h</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Report Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Order Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed</span>
                    <div className="flex items-center gap-2">
                      <Progress value={reportData.completionRate} className="w-24" />
                      <span className="text-sm text-gray-600">{reportData.completedOrders}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending</span>
                    <div className="flex items-center gap-2">
                      <Progress value={reportData.totalOrders > 0 ? (reportData.pendingOrders / reportData.totalOrders) * 100 : 0} className="w-24" />
                      <span className="text-sm text-gray-600">{reportData.pendingOrders}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Urgent</span>
                    <div className="flex items-center gap-2">
                      <Progress value={reportData.totalOrders > 0 ? (reportData.urgentOrders / reportData.totalOrders) * 100 : 0} className="w-24" />
                      <span className="text-sm text-gray-600">{reportData.urgentOrders}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">STAT</span>
                    <div className="flex items-center gap-2">
                      <Progress value={reportData.totalOrders > 0 ? (reportData.statOrders / reportData.totalOrders) * 100 : 0} className="w-24" />
                      <span className="text-sm text-gray-600">{reportData.statOrders}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Test Types Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(reportData.testTypes).map(([type, count]) => {
                    const percentage = reportData.totalOrders > 0 ? Math.round((count / reportData.totalOrders) * 100) : 0;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{type}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-24" />
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Priority Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Priority Orders Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{reportData.statOrders}</p>
                  <p className="text-sm text-gray-600">STAT Orders</p>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{reportData.urgentOrders}</p>
                  <p className="text-sm text-gray-600">Urgent Orders</p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Activity className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{reportData.pendingOrders}</p>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Turnaround Time Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Turnaround Time Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{reportData.avgTurnaroundTime}h</p>
                    <p className="text-sm text-gray-600">Average Turnaround Time</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>STAT Orders</span>
                      <span className="font-medium">≤ 1 hour</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Urgent Orders</span>
                      <span className="font-medium">≤ 4 hours</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Routine Orders</span>
                      <span className="font-medium">≤ 24 hours</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Productivity Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Productivity Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{reportData.completionRate}%</p>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Orders per Day</span>
                      <span className="font-medium">{Math.round(reportData.totalOrders / Math.max(1, differenceInDays(parseISO(dateRange.end), parseISO(dateRange.start))))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Efficiency Score</span>
                      <span className="font-medium">{Math.min(100, reportData.completionRate + 10)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quality Control Tab */}
        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Quality Control Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Quality control metrics will be displayed here</p>
                <p className="text-sm text-gray-400 mt-2">This section will show QC test results, compliance metrics, and quality trends</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Daily Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.dailyTrends.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{day.date}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{day.orders}</p>
                        <p className="text-xs text-gray-600">Total Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{day.completed}</p>
                        <p className="text-xs text-gray-600">Completed</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => handleExportReport('pdf')} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Export as PDF
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('excel')} className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Export as Excel
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('csv')} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
