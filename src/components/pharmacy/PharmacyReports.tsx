import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  Users,
  Pill,
  Activity,
  FileText,
  Printer
} from 'lucide-react';
import { format, parseISO, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function PharmacyReports() {
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const reportData = {
    overview: {
      totalPrescriptions: 1247,
      totalRevenue: 45680.50,
      averagePrescriptionValue: 36.65,
      topMedications: [
        { name: 'Amoxicillin 500mg', count: 156, revenue: 780.00 },
        { name: 'Metformin 1000mg', count: 134, revenue: 482.40 },
        { name: 'Lisinopril 10mg', count: 98, revenue: 627.20 },
        { name: 'Atorvastatin 20mg', count: 87, revenue: 522.00 },
        { name: 'Omeprazole 20mg', count: 76, revenue: 304.00 }
      ],
      prescriptionTrends: [
        { month: 'Jan', count: 98 },
        { month: 'Feb', count: 112 },
        { month: 'Mar', count: 105 },
        { month: 'Apr', count: 128 },
        { month: 'May', count: 134 },
        { month: 'Jun', count: 142 }
      ]
    },
    inventory: {
      totalMedications: 245,
      lowStockItems: 12,
      outOfStockItems: 3,
      expiringSoon: 8,
      totalInventoryValue: 125430.75,
      inventoryTurnover: 3.2,
      topCategories: [
        { category: 'Antibiotics', count: 45, value: 15680.50 },
        { category: 'Cardiovascular', count: 38, value: 23450.75 },
        { category: 'Diabetes', count: 32, value: 18920.25 },
        { category: 'Analgesics', count: 28, value: 12340.00 },
        { category: 'Respiratory', count: 25, value: 15680.50 }
      ]
    },
    performance: {
      averageVerificationTime: 4.5,
      verificationRate: 98.5,
      customerSatisfaction: 4.7,
      prescriptionAccuracy: 99.2,
      inventoryAccuracy: 97.8,
      staffProductivity: [
        { staff: 'Pharmacist A', prescriptions: 156, accuracy: 99.5 },
        { staff: 'Pharmacist B', prescriptions: 142, accuracy: 98.8 },
        { staff: 'Technician A', prescriptions: 98, accuracy: 97.2 },
        { staff: 'Technician B', prescriptions: 87, accuracy: 98.5 }
      ]
    }
  };

  const generateReport = () => {
    console.log('Generating report:', { reportType, dateRange, selectedMonth });
    // Implement report generation logic
  };

  const exportReport = (format: any) => {
    console.log('Exporting report as:', format);
    // Implement export logic
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Pharmacy Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="performance">Performance Report</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="month-select" className="text-sm font-medium text-gray-700 mb-1 block">Month</label>
              <input
                id="month-select"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select month for report"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={generateReport} className="flex-1">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate
              </Button>
              <Button variant="outline" onClick={() => exportReport('pdf')} aria-label="Export report as PDF">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.overview.totalPrescriptions}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${reportData.overview.totalRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Prescription Value</p>
                    <p className="text-2xl font-bold text-purple-600">${reportData.overview.averagePrescriptionValue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                    <p className="text-2xl font-bold text-blue-600">+12.5%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-green-600" />
                Top Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.overview.topMedications.map((medication, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{medication.name}</p>
                        <p className="text-sm text-gray-600">{medication.count} prescriptions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${medication.revenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prescription Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Prescription Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.overview.prescriptionTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{trend.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(trend.count / 150) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{trend.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Report */}
      {reportType === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Medications</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.inventory.totalMedications}</p>
                  </div>
                  <Pill className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                    <p className="text-2xl font-bold text-green-600">${reportData.inventory.totalInventoryValue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Turnover Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{reportData.inventory.inventoryTurnover}x</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">Low Stock Items</p>
                    <p className="text-2xl font-bold text-orange-600">{reportData.inventory.lowStockItems}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600">{reportData.inventory.outOfStockItems}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Expiring Soon</p>
                    <p className="text-2xl font-bold text-yellow-600">{reportData.inventory.expiringSoon}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Inventory by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.inventory.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-gray-600">{category.count} medications</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${category.value.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Value</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Report */}
      {reportType === 'performance' && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Verification Rate</p>
                    <p className="text-2xl font-bold text-green-600">{reportData.performance.verificationRate}%</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Verification Time</p>
                    <p className="text-2xl font-bold text-blue-600">{reportData.performance.averageVerificationTime}m</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                    <p className="text-2xl font-bold text-purple-600">{reportData.performance.customerSatisfaction}/5</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff Productivity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Staff Productivity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.performance.staffProductivity.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{staff.staff}</p>
                        <p className="text-sm text-gray-600">{staff.prescriptions} prescriptions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{staff.accuracy}%</p>
                      <p className="text-sm text-gray-600">Accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>{"Export Options"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportReport('pdf')}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => exportReport('excel')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => exportReport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
