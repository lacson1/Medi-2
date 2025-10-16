import React from 'react';
import { Button } from "@/components/ui/button";
import { Syringe, Edit, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PatientVaccinations({ vaccinations, isLoading, onEdit }) {
  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }
  if (!vaccinations || vaccinations.length === 0) {
    return (
      <div className="text-center py-12">
        <Syringe className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No vaccination records found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vaccine</TableHead>
            <TableHead>Date Administered</TableHead>
            <TableHead>Administrator</TableHead>
            <TableHead>Lot #</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vaccinations.map((vax) => (
            <TableRow key={vax.id}>
              <TableCell className="font-medium">{vax.vaccine_name}</TableCell>
              <TableCell>{format(parseISO(vax.date_administered), "MMM d, yyyy")}</TableCell>
              <TableCell>{vax.administrator}</TableCell>
              <TableCell>{vax.lot_number}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(vax)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}