import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, Edit, ExternalLink, MoreVertical, CalendarPlus, FileHeart, Pill, Beaker } from "lucide-react";
import { differenceInYears, parseISO, format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PatientCard({ patient, onEdit }) {
  const age = patient.date_of_birth 
    ? differenceInYears(new Date(), parseISO(patient.date_of_birth))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-600" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {patient.first_name} {patient.last_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {age ? `${age} years old` : "Age unknown"} • {patient.gender || "N/A"}
                </p>
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
                    <Link to={`${createPageUrl("PatientProfile")}?id=${patient.id}`} className="flex items-center cursor-pointer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(patient)} className="flex items-center cursor-pointer">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Patient
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`${createPageUrl("PatientProfile")}?id=${patient.id}`} className="flex items-center cursor-pointer">
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Schedule Appointment
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`${createPageUrl("PatientProfile")}?id=${patient.id}`} className="flex items-center cursor-pointer">
                      <FileHeart className="w-4 h-4 mr-2" />
                      New Encounter
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`${createPageUrl("PatientProfile")}?id=${patient.id}`} className="flex items-center cursor-pointer">
                      <Pill className="w-4 h-4 mr-2" />
                      New Prescription
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`${createPageUrl("PatientProfile")}?id=${patient.id}`} className="flex items-center cursor-pointer">
                      <Beaker className="w-4 h-4 mr-2" />
                      Order Lab Test
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to={`${createPageUrl("PatientProfile")}?id=${patient.id}`}>
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
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            {patient.email || "No email"}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            {patient.phone || "No phone"}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            DOB: {patient.date_of_birth ? format(parseISO(patient.date_of_birth), "MMM d, yyyy") : "Unknown"}
          </div>
          
          {patient.blood_type && patient.blood_type !== 'unknown' && (
            <Badge variant="outline" className="border-red-200 text-red-700">
              Blood Type: {patient.blood_type}
            </Badge>
          )}
          
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Allergies:</p>
              <div className="flex flex-wrap gap-1">
                {patient.allergies.slice(0, 3).map((allergy, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs bg-orange-50 text-orange-700">
                    {allergy}
                  </Badge>
                ))}
                {patient.allergies.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{patient.allergies.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link to={`${createPageUrl("PatientProfile")}?id=${patient.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                View Full Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}