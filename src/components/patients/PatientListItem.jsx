import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Edit, ExternalLink, MoreVertical, CalendarPlus, FileHeart, Pill, Beaker } from "lucide-react";
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

export default function PatientListItem({ patient, onEdit }) {
  const age = patient.date_of_birth 
    ? differenceInYears(new Date(), parseISO(patient.date_of_birth))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 group">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1 items-center">
              <div className="truncate">
                <h3 className="font-bold text-gray-900 truncate">
                  {patient.first_name} {patient.last_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {age ? `${age} yrs` : "N/A"} • {patient.gender || "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 truncate sm:col-span-2 md:col-span-1">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{patient.email || "No email"}</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 truncate">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{patient.phone || "No phone"}</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                {patient.blood_type && patient.blood_type !== 'unknown' && (
                  <Badge variant="outline" className="border-red-200 text-red-700">
                    {patient.blood_type}
                  </Badge>
                )}
                {patient.status && (
                   <Badge variant="outline" className={patient.status === 'active' ? 'border-green-200 text-green-700' : 'border-gray-300'}>
                    {patient.status}
                  </Badge>
                )}
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
        </CardContent>
      </Card>
    </motion.div>
  );
}