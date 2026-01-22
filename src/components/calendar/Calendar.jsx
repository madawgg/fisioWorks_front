import { useRef, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";
import "./calendar.css";

// Opciones de estado para el filtro
const statusOptions = [
  { value: "all", label: "Todos los estados", color: "#1a1a1a" },
  { value: "scheduled", label: "Programadas", color: "#3788d8" },
  { value: "completed", label: "Completadas", color: "#28a745" },
  { value: "cancelled", label: "Canceladas", color: "#dc3545" },
  { value: "pending", label: "Pendientes", color: "#ffc107" },
];

export default function Calendar({ 
  events, 
  onEventClick, 
  onSlotClick, 
  statusFilter, 
  onStatusFilterChange,
  therapistFilter,
  onTherapistFilterChange,
  therapists,
  canFilterByTherapist
}) {
  const calendarRef = useRef(null);
  const [initialView, setInitialView] = useState("dayGridMonth");
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setInitialView(isMobile ? "dayGridMonth" : "dayGridList");
  }, []);

  const handleDateClick = (info) => {
    const calendarApi = calendarRef.current?.getApi();
    const clickedDate = new Date(info.dateStr);
    const now = new Date();
    
    // Si estamos en la vista de día (timeGridDay), solo permitir crear citas en horarios futuros
    if (currentView === "timeGridDay") {
      // Prevenir crear citas en horarios pasados
      if (clickedDate < now) {
        return; // No abrir modal si es un horario pasado
      }
      onSlotClick?.(info.dateStr);
      return;
    }
    
    // En vista mensual, permitir click en cualquier día para ver el día completo
    if (calendarApi) {
      calendarApi.changeView("timeGridDay", info.dateStr);
      setCurrentView("timeGridDay");
    }
  };

  const handleViewChange = (viewInfo) => {
    setCurrentView(viewInfo.view.type);
  };

  const handleMonthYearChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
    const calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(new Date(newYear, newMonth, 1));
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const years = [];
  for (
    let y = new Date().getFullYear() - 2;
    y <= new Date().getFullYear() + 5;
    y++
  ) {
    years.push(y);
  }

  // Obtener el color del estado seleccionado
  const selectedStatusColor = statusOptions.find(s => s.value === statusFilter)?.color || "#1a1a1a";

  return (
    <div className="card shadow-sm w-100 p-3">
      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={month}
            onChange={(e) =>
              handleMonthYearChange(parseInt(e.target.value), year)
            }
          >
            {monthNames.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="form-select form-select-sm"
            value={year}
            onChange={(e) =>
              handleMonthYearChange(month, parseInt(e.target.value))
            }
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          {/* Filtro de terapeuta - solo para admin/therapist */}
          {canFilterByTherapist && (
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
                value={therapistFilter}
                onChange={(e) => onTherapistFilterChange(e.target.value)}
                style={{ minWidth: "180px" }}
              >
                <option value="all">Todos los terapeutas</option>
                {therapists.map((therapist) => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro de estado */}
          <div className="d-flex align-items-center gap-2">
            <span 
              className="rounded-circle" 
              style={{ 
                width: "12px", 
                height: "12px", 
                backgroundColor: selectedStatusColor,
                display: "inline-block"
              }}
            />
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              style={{ minWidth: "160px" }}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <FullCalendar
        headerToolbar={{
          left: "dayGridMonth,timeGridDay",
          right: "title",
        }}
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={initialView}
        locale={esLocale}
        events={events}
        dateClick={handleDateClick}
        eventClick={onEventClick}
        datesSet={handleViewChange}
        selectable={true}
        selectMirror={true}
        slotMinTime="08:00:00"
        slotMaxTime="21:00:00"
        slotDuration="00:30:00"
        allDaySlot={false}
        height={"80vh"}
        dayMaxEvents={false}
        slotEventOverlap={true}
        eventMaxStack={4}
        dayMaxEventRows={false}
        selectAllow={(selectInfo) => {
          // Solo permitir seleccionar fechas futuras
          const now = new Date();
          return selectInfo.start >= now;
        }}
        dayCellClassNames={(arg) => {
          // Agregar clase para días pasados en vista mensual
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const cellDate = new Date(arg.date);
          cellDate.setHours(0, 0, 0, 0);
          
          if (cellDate < today) {
            return ['fc-day-past-clickable'];
          }
          return [];
        }}
        slotLaneClassNames={(arg) => {
          // Agregar clase para slots de tiempo pasados en vista de día
          const now = new Date();
          if (arg.date < now) {
            return ['fc-slot-past'];
          }
          return [];
        }}
      />
    </div>
  );
}
