'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { findGroupedCalendar } from '../services/events/event.api';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const EVENT_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-red-100 text-red-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
  'bg-orange-100 text-orange-700',
];

interface Event {
  id: string;
  title: string;
  description?: string;
  datetime: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  createdBy?: string;
}

interface EventsByDay {
  [day: string]: Event[];
}

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
}

export default function CalendarAgenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventsByDay>({});
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Função para gerar cor aleatória
  const getRandomColor = (): string => {
    return EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)];
  };

  // Buscar eventos da API quando mudar mês/ano
  useEffect(() => {
    fetchEvents();
  }, [month, year]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await findGroupedCalendar(month, year);
      setEvents(data);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      setEvents({});
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (): number => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days: CalendarDay[] = [];

    // Dias do mês anterior
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day),
      });
    }

    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day),
      });
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const handleNewEvent = () => {
    console.log('Criar novo evento');
    // router.push('/events/new');
  };

  const handleEditEvent = () => {
    if (selectedEvent) {
      console.log('Editar evento:', selectedEvent.id);
      // router.push(`/events/${selectedEvent.id}/edit`);
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <AppLayout>
      <div className="min-h-screen p-4 md:p-8 w-auto">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Agenda
                </h1>
                <p className="text-gray-500 text-sm md:text-base mt-1">
                  Visualize seus eventos do mês
                </p>
              </div>
              
              {/* Month/Year Selector */}
              <div className="flex gap-2">
                <select
                  value={month}
                  onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                >
                  {MONTHS.map((monthName, index) => (
                    <option key={index} value={index}>
                      {monthName}
                    </option>
                  ))}
                </select>
                
                <select
                  value={year}
                  onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), month, 1))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Mês anterior"
            >
              <ChevronLeft size={24} />
            </button>

            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              {MONTHS[month]} {year}
            </h2>

            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Próximo mês"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          )}

          {/* Calendar Grid */}
          {!isLoading && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="py-2 md:py-3 text-center text-xs md:text-sm font-semibold text-gray-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((dayInfo, index) => {
                  const dayEvents = dayInfo.isCurrentMonth
                    ? events[dayInfo.day.toString()] || []
                    : [];

                  return (
                    <div
                      key={index}
                      className={`min-h-24 md:min-h-32 border-r border-b border-gray-200 p-1 md:p-2 ${
                        !dayInfo.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-gray-50 transition-colors`}
                    >
                      <div
                        className={`text-xs md:text-sm mb-1 md:mb-2 ${
                          dayInfo.isCurrentMonth
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-400'
                        }`}
                      >
                        {dayInfo.day}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 md:p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity ${getRandomColor()}`}
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="font-medium truncate">
                              {event.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Event Details Modal */}
          {selectedEvent && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedEvent(null)}
            >
              <div
                className="bg-white rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4">{selectedEvent.title}</h3>

                {selectedEvent.description && (
                  <p className="text-gray-600 mb-4">{selectedEvent.description}</p>
                )}

                <div className="space-y-2 text-gray-600">
                  <p>
                    <strong>Data:</strong>{' '}
                    {new Date(selectedEvent.datetime).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p>
                    <strong>Hora:</strong>{' '}
                    {new Date(selectedEvent.datetime).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={handleEditEvent}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}