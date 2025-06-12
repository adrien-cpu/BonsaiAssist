import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { CareReminder } from '@/types';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CareCalendarProps {
  reminders: CareReminder[];
  onReminderClick?: (reminder: CareReminder) => void;
  onDateSelect?: (date: Date) => void;
}

export function CareCalendar({ reminders, onReminderClick, onDateSelect }: CareCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const getRemindersForDate = (date: Date) => {
    return reminders.filter(reminder => 
      isSameDay(new Date(reminder.dueDate), date)
    );
  };

  const getRemindersForMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const daysInMonth = eachDayOfInterval({ start, end });
    
    return daysInMonth.filter(day => 
      getRemindersForDate(day).length > 0
    );
  };

  const selectedDateReminders = getRemindersForDate(selectedDate);
  const monthReminders = getRemindersForMonth(currentMonth);

  const getReminderIcon = (type: CareReminder['type']) => {
    switch (type) {
      case 'watering':
        return <Icons.droplets className="h-4 w-4 text-blue-500" />;
      case 'fertilizing':
        return <Icons.leaf className="h-4 w-4 text-green-500" />;
      case 'pruning':
        return <Icons.scissors className="h-4 w-4 text-orange-500" />;
      case 'repotting':
        return <Icons.move className="h-4 w-4 text-purple-500" />;
      case 'inspection':
        return <Icons.eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Icons.bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: CareReminder['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect?.(date);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.calendar className="h-5 w-5" />
            Calendrier des soins
          </CardTitle>
          <CardDescription>
            Planifiez et suivez les soins de vos bonsaïs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            onMonthChange={setCurrentMonth}
            locale={fr}
            className="rounded-md border"
            modifiers={{
              hasReminders: monthReminders,
            }}
            modifiersStyles={{
              hasReminders: {
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 'bold',
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Soins du {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
          </CardTitle>
          <CardDescription>
            {selectedDateReminders.length === 0 
              ? 'Aucun soin prévu pour cette date'
              : `${selectedDateReminders.length} soin(s) prévu(s)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedDateReminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icons.calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun soin prévu pour cette date</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => onDateSelect?.(selectedDate)}
                >
                  Ajouter un soin
                </Button>
              </div>
            ) : (
              selectedDateReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onReminderClick?.(reminder)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getReminderIcon(reminder.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{reminder.title}</h4>
                      <Badge 
                        size="sm" 
                        className={getPriorityColor(reminder.priority)}
                      >
                        {reminder.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {reminder.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" size="sm">
                        {reminder.frequency}
                      </Badge>
                      {reminder.isCompleted && (
                        <Badge variant="outline" size="sm" className="text-green-600">
                          <Icons.success className="h-3 w-3 mr-1" />
                          Terminé
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}