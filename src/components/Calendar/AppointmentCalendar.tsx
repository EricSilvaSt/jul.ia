import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import AppointmentModal from './AppointmentModal';
import { Appointment, Dentist } from '../../types';
import { convertFromUTC } from '../../utils/timezone';

interface CalendarProps {
  appointments: Appointment[];
  dentists: Dentist[];
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
}

const AppointmentCalendar: React.FC<CalendarProps> = ({
  appointments,
  dentists,
  onAddAppointment,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const handleAddAppointment = (appointment: Omit<Appointment, 'id'>) => {
    onAddAppointment(appointment);
    closeModal();
  };

  const getAppointmentsForDate = (day: number) => {
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.data_agendamento);
      return appointmentDate.toDateString() === targetDate.toDateString();
    });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 flex items-center justify-between bg-blue-600 text-white">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-blue-500 focus:outline-none transition-colors duration-200"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-blue-500 focus:outline-none transition-colors duration-200"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 bg-gray-100">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center py-2 text-sm font-medium text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 p-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="p-2"></div>;
          }

          const dateAppointments = getAppointmentsForDate(day);
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={`day-${day}`}
              className={`p-1 min-h-[100px] border rounded-md ${
                isToday ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
              } cursor-pointer transition-colors duration-200`}
              onClick={() => handleDateClick(day)}
            >
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : ''
                  }`}
                >
                  {day}
                </span>
                <button className="text-gray-400 hover:text-blue-600">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1">
                {dateAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`text-xs p-1 rounded truncate ${
                      appointment.status === 'confirmado'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'cancelado'
                        ? 'bg-red-100 text-red-800'
                        : appointment.status === 'concluido'
                        ? 'bg-gray-100 text-gray-800'
                        : appointment.status === 'falta'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {convertFromUTC(appointment.data_agendamento).time} - {appointment.patientName}
                  </div>
                ))}
                {dateAppointments.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +{dateAppointments.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && selectedDate && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={closeModal}
          date={selectedDate}
          dentists={dentists}
          onSave={handleAddAppointment}
        />
      )}
    </div>
  );
};

export default AppointmentCalendar;