import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PatientCard from "./PatientCard";
import PatientListItem from "./PatientListItem";

export default function VirtualizedPatientList({
  patients,
  view,
  onEdit,
  selectedPatients,
  onSelectPatient,
  itemHeight = 120,
  containerHeight = 600
}) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;

      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 2, patients.length);

      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => container.removeEventListener('scroll', handleScroll);
  }, [patients.length, itemHeight, containerHeight]);

  const visiblePatients = patients.slice(visibleRange.start, visibleRange.end);
  const totalHeight = patients.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  if (patients.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          <AnimatePresence>
            {visiblePatients.map((patient: any) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                style={{ height: itemHeight }}
                className={view === 'grid' ? 'mb-6' : 'mb-3'}
              >
                {view === 'grid' ? (
                  <PatientCard
                    patient={patient}
                    onEdit={onEdit}
                    isSelected={selectedPatients.includes(patient.id)}
                    onSelect={onSelectPatient}
                  />
                ) : (
                  <PatientListItem
                    patient={patient}
                    onEdit={onEdit}
                    isSelected={selectedPatients.includes(patient.id)}
                    onSelect={onSelectPatient}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
