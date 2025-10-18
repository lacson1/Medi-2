import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, Edit, Calendar, ChevronDown, ChevronUp, Search, Filter, Clock, AlertCircle, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import ConsultationDataDisplay from "../specialty-consultations/ConsultationDataDisplay";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import PropTypes from 'prop-types';

const statusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    label: "Pending"
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Calendar,
    label: "Completed"
  },
  reviewed: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: FileText,
    label: "Reviewed"
  },
};

export default function PatientSpecialtyConsultations({ consultations, templates, isLoading, onEdit }: any) {
  const [expandedIds, setExpandedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const toggleExpanded = (id: any) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Filter and sort consultations
  const filteredConsultations = consultations
    ?.filter(consultation => {
      const matchesSearch =
        consultation.specialist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.summary.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || consultation.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.consultation_date) - new Date(a.consultation_date);
        case "specialist":
          return a.specialist_name.localeCompare(b.specialist_name);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    }) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
      </div>
    );
  }

  if (!consultations || consultations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCog className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Specialty Consultations</h3>
        <p className="text-gray-500 mb-4">No specialty consultations have been recorded for this patient yet.</p>
        <Button onClick={() => onEdit(null)} className="bg-blue-600 hover:bg-blue-700">
          <UserCog className="w-4 h-4 mr-2" />
          Add First Consultation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search consultations by specialist, template, or summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="specialist">Sort by Specialist</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {filteredConsultations.length !== consultations.length && (
            <p className="text-sm text-gray-600 mt-2">
              Showing {filteredConsultations.length} of {consultations.length} consultations
            </p>
          )}
        </CardContent>
      </Card>

      {/* Consultations List */}
      <div className="space-y-4">
        {filteredConsultations.map((consultation: any) => {
          const config = statusConfig[consultation.status] || {};
          const StatusIcon = config.icon || AlertCircle;
          const date = parseISO(consultation.consultation_date);
          const isExpanded = expandedIds.includes(consultation.id);
          const template = templates?.find(t => t.id === consultation.template_id);

          return (
            <Card key={consultation.id} className="border-2 border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <UserCog className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-900">{consultation.specialist_name}</CardTitle>
                        <p className="text-sm text-gray-600">{consultation.template_name}</p>
                      </div>
                      <Badge className={`${config.color} border`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(date, "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(date, "h:mm a")}
                      </div>
                    </div>

                    {consultation.summary && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-700 font-medium text-sm">{consultation.summary}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(consultation)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(consultation.id)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 border-t rounded-none"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        View Details
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-4 bg-gray-50/50">
                    <ConsultationDataDisplay
                      data={consultation.consultation_data}
                      schema={template?.template_schema}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {filteredConsultations.length === 0 && consultations.length > 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-500 mb-4">
              No consultations match your current search and filter criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

PatientSpecialtyConsultations.propTypes = {
  consultations: PropTypes.array,
  templates: PropTypes.array,
  isLoading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired
};