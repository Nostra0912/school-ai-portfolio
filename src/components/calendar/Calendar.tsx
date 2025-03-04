import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  event_type: string;
  location?: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString())
        .order('start_time');

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_time), date)
    );
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-px border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="px-4 py-2 text-sm font-medium text-gray-900 text-center bg-gray-50"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, dayIdx) => {
            const dayEvents = getEventsForDay(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div
                key={day.toString()}
                className={`min-h-[120px] bg-white ${
                  !isSameMonth(day, currentDate) ? 'bg-gray-50' : ''
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`px-3 py-2 ${
                  isSelected ? 'bg-primary/10' : ''
                }`}>
                  <time
                    dateTime={format(day, 'yyyy-MM-dd')}
                    className={`text-sm ${
                      isSameMonth(day, currentDate)
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {format(day, 'd')}
                  </time>
                  <div className="space-y-1 mt-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="px-2 py-1 text-xs rounded bg-primary/10 text-primary truncate"
                        title={event.title}
                      >
                        {format(new Date(event.start_time), 'HH:mm')} {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <div className="space-y-4">
            {getEventsForDay(selectedDate).map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {event.title}
                    </h4>
                    <div className="mt-1 text-sm text-gray-500">
                      {format(new Date(event.start_time), 'h:mm a')} - 
                      {format(new Date(event.end_time), 'h:mm a')}
                    </div>
                    {event.location && (
                      <div className="mt-1 text-sm text-gray-500">
                        {event.location}
                      </div>
                    )}
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {event.event_type}
                  </span>
                </div>
              </div>
            ))}
            {getEventsForDay(selectedDate).length === 0 && (
              <div className="text-gray-500 text-center py-4">
                No events scheduled for this day
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
