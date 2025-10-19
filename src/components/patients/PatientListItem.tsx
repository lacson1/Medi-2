import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone, Edit, ExternalLink, MoreVertical, CalendarPlus, FileHeart, Pill, Beaker, AlertTriangle, Heart, Activity } from "lucide-react";
import { differenceInYears, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PatientListItem({ patient, onEdit, isSelected, onSelect }: any) {
  const age = patient.date_of_birth
    ? differenceInYears(new Date(), parseISO(patient.date_of_birth))
    : null;

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getAgeGroupColor = (age: any) => {
    if (age === null) return 'bg-gray-100 text-gray-800';
    if (age < 2) return 'bg-pink-100 text-pink-800';
    if (age < 12) return 'bg-purple-100 text-purple-800';
    if (age < 18) return 'bg-blue-100 text-blue-800';
    if (age < 65) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getAgeGroup = (age: any) => {
    if (age === null) return 'Unknown';
    if (age < 2) return 'Infant';
    if (age < 12) return 'Child';
    if (age < 18) return 'Teen';
    if (age < 65) return 'Adult';
    return 'Senior';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={`md-card group hover:scale-[1.01] transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-1 min-w-0">
              {onSelect && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onSelect(patient.id)}
                />
              )}
              {/* Avatar with allergy indicator */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                  {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                </div>
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Patient Info Grid */}
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 items-center">
                {/* Name and Age */}
                <div className="truncate">
                  <h3 className="md-title-large text-gray-900 truncate">
                    {patient.first_name} {patient.last_name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="md-body-medium text-gray-500">
                      {age ? `${age} yrs` : "N/A"} • {patient.gender || "N/A"}
                    </p>
                    <Badge variant="outline" className={`md-label-large ${getAgeGroupColor(age)}`}>
                      {getAgeGroup(age)}
                    </Badge>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex items-center gap-3 md-body-large text-gray-600 truncate">
                  <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{patient.email || "No email"}</span>
                </div>

                <div className="hidden sm:flex items-center gap-3 md-body-large text-gray-600 truncate">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{patient.phone || "No phone"}</span>
                </div>

                {/* Status and Medical Info */}
                <div className="hidden lg:flex items-center gap-3">
                  <Badge variant="outline" className={`md-label-large ${getStatusColor(patient.status)}`}>
                    <Activity className="w-4 h-4 mr-2" />
                    {patient.status || 'Active'}
                  </Badge>
                  {patient.blood_type && patient.blood_type !== 'unknown' && (
                    <Badge variant="outline" className="md-label-large border-red-200 text-red-700">
                      <Heart className="w-4 h-4 mr-2" />
                      {patient.blood_type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 h-12 w-12"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={`/patients/${patient.id}`} className="flex items-center cursor-pointer">
                      <ExternalLink className="w-4 h-4 mr-3" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(patient)} className="flex items-center cursor-pointer">
                    <Edit className="w-4 h-4 mr-3" />
                    Edit Patient
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/patients/${patient.id}`} className="flex items-center cursor-pointer">
                      <CalendarPlus className="w-4 h-4 mr-3" />
                      Schedule Appointment
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/patients/${patient.id}`} className="flex items-center cursor-pointer">
                      <FileHeart className="w-4 h-4 mr-3" />
                      New Encounter
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/patients/${patient.id}`} className="flex items-center cursor-pointer">
                      <Pill className="w-4 h-4 mr-3" />
                      New Prescription
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/patients/${patient.id}`} className="flex items-center cursor-pointer">
                      <Beaker className="w-4 h-4 mr-3" />
                      Order Lab Test
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to={`/patients/${patient.id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-blue-50 h-12 w-12"
                >
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}