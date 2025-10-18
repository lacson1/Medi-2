import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, Users, Calendar, Beaker, Pill } from "lucide-react";
import { createPageUrl } from "@/utils";

const normalizeText = (value: any) =>
  (value || "")
    .toString()
    .toLowerCase()
    .trim();

export default function SmartSearch({
  patients = [],
  appointments = [],
  labOrders = [],
  prescriptions = [],
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: any) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    if (!query) return [];
    const needle = normalizeText(query);

    const patientResults = patients
      .filter((patient: any) => {
        const fullName = normalizeText(
          `${patient.first_name || ""} ${patient.last_name || ""}`
        );
        return (
          fullName.includes(needle) ||
          normalizeText(patient.email).includes(needle) ||
          normalizeText(patient.phone).includes(needle)
        );
      })
      .slice(0, 5)
      .map((patient: any) => ({
        id: patient.id,
        label: `${patient.first_name || ""} ${patient.last_name || ""}`.trim() ||
          "Unnamed Patient",
        description: patient.email || patient.phone || "Patient record",
        icon: Users,
        href: `${createPageUrl("Patients")}?search=${patient.id}`,
      }));

    const appointmentResults = appointments
      .filter((appointment: any) => {
        const patientName = normalizeText(appointment.patient_name);
        const provider = normalizeText(appointment.provider);
        return (
          patientName.includes(needle) ||
          provider.includes(needle) ||
          normalizeText(appointment.reason).includes(needle)
        );
      })
      .slice(0, 5)
      .map((appointment: any) => ({
        id: appointment.id,
        label: appointment.patient_name || "Appointment",
        description: `${formatAppointmentDate(
          appointment.appointment_date
        )} · ${appointment.status || "status unknown"}`,
        icon: Calendar,
        href: `${createPageUrl("Appointments")}?appointment=${appointment.id}`,
      }));

    const labResults = labOrders
      .filter((order: any) => {
        return (
          normalizeText(order.test_name).includes(needle) ||
          normalizeText(order.patient_name).includes(needle)
        );
      })
      .slice(0, 5)
      .map((order: any) => ({
        id: order.id,
        label: order.test_name || "Lab Order",
        description: `${order.patient_name || "Unknown patient"} · ${
          order.status || "pending"
        }`,
        icon: Beaker,
        href: `${createPageUrl("LabManagement")}?lab=${order.id}`,
      }));

    const prescriptionResults = prescriptions
      .filter((rx: any) => {
        return (
          normalizeText(rx.medication_name).includes(needle) ||
          normalizeText(rx.patient_name).includes(needle)
        );
      })
      .slice(0, 5)
      .map((rx: any) => ({
        id: rx.id,
        label: rx.medication_name || "Prescription",
        description: `${rx.patient_name || "Unknown patient"} · ${
          rx.status || "status unknown"
        }`,
        icon: Pill,
        href: `${createPageUrl("PharmacyManagement")}?prescription=${rx.id}`,
      }));

    return [
      { type: "Patients", results: patientResults },
      { type: "Appointments", results: appointmentResults },
      { type: "Lab Orders", results: labResults },
      { type: "Prescriptions", results: prescriptionResults },
    ].filter((group: any) => group.results.length > 0);
  }, [appointments, labOrders, patients, prescriptions, query]);

  const handleResultClick = (href: any) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2"
      >
        <Search className="h-4 w-4" />
        Search workspace
        <kbd className="ml-2 hidden lg:inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search patients, appointments, labs, prescriptions..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults.map((group: any) => (
            <CommandGroup key={group.type} heading={group.type}>
              {group.results.map((result: any) => {
                const IconComponent = result.icon;
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleResultClick(result.href)}
                    className="flex items-center gap-3"
                  >
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {result.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.description}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

const formatAppointmentDate = (value: any) => {
  if (!value) return "No date";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};
