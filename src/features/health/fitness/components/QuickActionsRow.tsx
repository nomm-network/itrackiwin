import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  History, 
  Calendar, 
  Users 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActionsRow() {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'templates',
      label: 'Templates',
      icon: <FileText className="w-5 h-5" />,
      path: '/app/programs',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'history',
      label: 'History',
      icon: <History className="w-5 h-5" />,
      path: '/fitness/history',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'programs',
      label: 'Programs',
      icon: <Calendar className="w-5 h-5" />,
      path: '/app/programs',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'mentors',
      label: 'Mentors',
      icon: <Users className="w-5 h-5" />,
      path: '/mentors',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              onClick={() => navigate(action.path)}
              className={`h-20 flex flex-col items-center justify-center gap-2 text-white ${action.color}`}
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}