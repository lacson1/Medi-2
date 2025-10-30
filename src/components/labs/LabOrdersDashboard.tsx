import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { mockApiClient } from '@/api/mockApiClient';
import {
  Plus,
  Upload as UploadIcon,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  TestTube,
} from 'lucide-react';
import LabOrdersDataGrid from './LabOrdersDataGrid';
import LabOrderWizard from './LabOrderWizard';
import UploadLabResultModal from './UploadLabResultModal';
import LabAnalytics from './LabAnalytics';

type LabOrdersDashboardProps = {
  onNavigateToPatient?: (patientId: string) => void;
};

export default function LabOrdersDashboard({ onNavigateToPatient }: LabOrdersDashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'workflow' | 'reports' | 'analytics'>('orders');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: labOrders = [], isLoading } = useQuery({
    queryKey: ['labOrders'],
    queryFn: () => mockApiClient.entities.LabOrder.list(),
  });

  const stats = useMemo(() => {
    const total = labOrders.length;
    const pending = labOrders.filter((o: any) => o.status === 'pending' || o.status === 'in_process').length;
    const completedToday = labOrders.filter((o: any) => o.status === 'completed').length; // simplify for scaffold
    const stat = labOrders.filter((o: any) => o.priority === 'stat').length;
    const overdue = labOrders.filter((o: any) => o.status === 'overdue').length;
    return { total, pending, completedToday, stat, overdue };
  }, [labOrders]);

  return (
    <div className="space-y-4">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Lab Orders & Tests</div>
            <div className="text-sm text-muted-foreground">Manage tests, workflow, and results</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsUploadOpen(true)}>
              <UploadIcon className="w-4 h-4 mr-2" /> Upload Results
            </Button>
            <Button onClick={() => setIsWizardOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> New Order
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatsCard icon={TestTube} label="Total Orders" value={stats.total} color="" />
        <StatsCard icon={Clock} label="Pending" value={stats.pending} color="text-amber-600" />
        <StatsCard icon={CheckCircle} label="Completed Today" value={stats.completedToday} color="text-emerald-600" />
        <StatsCard icon={AlertTriangle} label="STAT Orders" value={stats.stat} color="text-fuchsia-600" />
        <StatsCard icon={AlertTriangle} label="Overdue" value={stats.overdue} color="text-red-600" />
      </div>

      {/* Tabs with counts */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="orders">Orders <Badge variant="secondary" className="ml-2">{stats.total}</Badge></TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patient, test, doctor, status"
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" onClick={() => setFiltersOpen((v) => !v)}>
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>
            </div>
          </div>

          <Separator className="my-3" />

          <TabsContent value="orders" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <LabOrdersDataGrid
                  isLoading={isLoading}
                  orders={labOrders}
                  search={search}
                  onNavigateToPatient={onNavigateToPatient}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow">{/* Placeholder to keep scope minimal for this scaffold */}
            <Card><CardContent>Workflow coming next.</CardContent></Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card><CardContent>Reports coming next.</CardContent></Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <LabAnalytics labOrders={labOrders} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <LabOrderWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} />
      <UploadLabResultModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}

function StatsCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color?: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
          </div>
          <Icon className={`w-6 h-6 ${color ?? ''}`} />
        </div>
      </CardContent>
    </Card>
  );
}


