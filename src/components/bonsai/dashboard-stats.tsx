import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { BonsaiProfile, CareReminder } from '@/types';

interface DashboardStatsProps {
  bonsaiProfiles: BonsaiProfile[];
  careReminders: CareReminder[];
}

export function DashboardStats({ bonsaiProfiles, careReminders }: DashboardStatsProps) {
  const totalBonsai = bonsaiProfiles.length;
  const pendingReminders = careReminders.filter(r => !r.isCompleted).length;
  const todayReminders = careReminders.filter(r => {
    const today = new Date();
    const reminderDate = new Date(r.dueDate);
    return reminderDate.toDateString() === today.toDateString() && !r.isCompleted;
  }).length;
  
  const healthyBonsai = bonsaiProfiles.filter(b => 
    b.healthStatus === 'excellent' || b.healthStatus === 'good'
  ).length;

  const stats = [
    {
      title: 'Mes Bonsaïs',
      value: totalBonsai,
      description: 'Total dans votre collection',
      icon: Icons.tree,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Soins en attente',
      value: pendingReminders,
      description: 'Tâches à effectuer',
      icon: Icons.bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: "Soins aujourd'hui",
      value: todayReminders,
      description: 'À faire maintenant',
      icon: Icons.calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Bonsaïs en santé',
      value: healthyBonsai,
      description: `${totalBonsai > 0 ? Math.round((healthyBonsai / totalBonsai) * 100) : 0}% de votre collection`,
      icon: Icons.heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <CardDescription className="text-xs">
              {stat.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}