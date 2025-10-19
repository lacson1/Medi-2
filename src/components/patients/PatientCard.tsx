import React, { memo, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone, Calendar, Edit, ExternalLink, MoreVertical, CalendarPlus, FileHeart, Pill, Beaker, AlertTriangle, Heart, Activity } from "lucide-react";
import { differenceInYears, parseISO, format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import type { Patient } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PatientCardProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  isSelected?: boolean;
  onSelect?: (patient: Patient) => void;
}

const PatientCard = memo(function PatientCard({ patient, onEdit, isSelected, onSelect }: PatientCardProps) {
  // Memoize expensive calculations
  const age = useMemo(() => {
    return patient.date_of_birth
      ? differenceInYears(new Date(), parseISO(patient.date_of_birth))
      : null;
  }, [patient.date_of_birth]);

  const statusColor = useMemo(() => {
    switch (patient.status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  }, [patient.status]);

  const ageGroupColor = useMemo(() => {
    if (age === null) return 'bg-gray-100 text-gray-800';
    if (age < 2) return 'bg-pink-100 text-pink-800';
    if (age < 12) return 'bg-purple-100 text-purple-800';
    if (age < 18) return 'bg-blue-100 text-blue-800';
    if (age < 65) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }, [age]);

  const ageGroup = useMemo(() => {
    if (age === null) return 'Unknown';
    if (age < 2) return 'Infant';
    if (age < 12) return 'Child';
    if (age < 18) return 'Teen';
    if (age < 65) return 'Adult';
    return 'Senior';
  }, [age]);

  const formattedDob = useMemo(() => {
    return patient.date_of_birth ? format(parseISO(patient.date_of_birth), "MMM d, yyyy") : "Unknown";
  }, [patient.date_of_birth]);

  const initials = useMemo(() => {
    return `${patient.first_name?.charAt(0) || ''}${patient.last_name?.charAt(0) || ''}`;
  }, [patient.first_name, patient.last_name]);

  // Memoize callback functions
  const handleSelect = useCallback(() => {
    onSelect(patient.id);
  }, [onSelect, patient.id]);

  const handleEdit = useCallback(() => {
    onEdit(patient);
  }, [onEdit, patient]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-[1.02] ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
        <div className={`h-2 bg-gradient-to-r ${patient.status === 'active' ? 'from-green-500 to-emerald-600' :
          patient.status === 'inactive' ? 'from-gray-400 to-gray-500' :
            'from-blue-500 to-cyan-600'
          }`} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {onSelect && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleSelect}
                  className="mt-1"
                />
              )}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                  {initials}
                </div>
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {patient.first_name} {patient.last_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-500">
                    {age ? `${age} years old` : "Age unknown"} • {patient.gender || "N/A"}
                  </p>
                  <Badge variant="outline" className={`text-xs ${ageGroupColor}`}>
                    {ageGroup}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={`/patients/${patient.id}`} className="flex items-center cursor-pointer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEdit} className="flex items-center cursor-pointer">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Patient
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/patients/${patient.id}`} className="flex items-center cursor-pointer">
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Schedule Appointment
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/patients/${patient.id}`} className="flex items-center cursor-pointer">
                      <FileHeart className="w-4 h-4 mr-2" />
                      New Encounter
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/patients/${patient.id}`} className="flex items-center cursor-pointer">
                      <Pill className="w-4 h-4 mr-2" />
                      New Prescription
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/patients/${patient.id}`} className="flex items-center cursor-pointer">
                      <Beaker className="w-4 h-4 mr-2" />
                      Order Lab Test
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to={`/patients/${patient.id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-blue-50"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status and Medical Info */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={statusColor}>
              <Activity className="w-3 h-3 mr-1" />
              {patient.status || 'Active'}
            </Badge>
            {patient.blood_type && patient.blood_type !== 'unknown' && (
              <Badge variant="outline" className="border-red-200 text-red-700">
                <Heart className="w-3 h-3 mr-1" />
                {patient.blood_type}
              </Badge>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{patient.email || "No email"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{patient.phone || "No phone"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>DOB: {formattedDob}</span>
            </div>
          </div>

          {/* Medical Conditions */}
          {patient.medical_conditions && patient.medical_conditions.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-medium">Medical Conditions:</p>
              <div className="flex flex-wrap gap-1">
                {patient.medical_conditions.slice(0, 2).map((condition, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                    {condition}
                  </Badge>
                ))}
                {patient.medical_conditions.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{patient.medical_conditions.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Allergies */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                Allergies:
              </p>
              <div className="flex flex-wrap gap-1">
                {patient.allergies.slice(0, 2).map((allergy, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs bg-red-50 text-red-700">
                    {allergy}
                  </Badge>
                ))}
                {patient.allergies.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{patient.allergies.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
              <Link to={`/patients/${patient.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Profile
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="px-3"
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default PatientCard;