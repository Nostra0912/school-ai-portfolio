import React from 'react';
import { School, PieChart, Users, FileText, ChevronRight } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, iconColor }: { 
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor: string;
}) => (
  <div className="card p-6 hover:scale-[1.02] transition-transform duration-200">
    <div className="flex items-center">
      <div className={`p-2 rounded-lg ${iconColor}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <h3 className="text-2xl font-semibold text-foreground">{value}</h3>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <StatCard
          icon={School}
          label="Managed Schools"
          value={52}
          iconColor="bg-primary"
        />
        <StatCard
          icon={Users}
          label="School Contacts"
          value={12}
          iconColor="bg-emerald-500"
        />
        <StatCard
          icon={FileText}
          label="Escalation Items"
          value={6}
          iconColor="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Interventions Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Interventions</h2>
            <button className="text-sm text-primary hover:text-primary/80 flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="h-64 flex items-center justify-center bg-secondary/50 rounded-lg">
            <PieChart className="w-12 h-12 text-primary/40" />
            <p className="text-muted-foreground ml-2">Intervention data visualization will be implemented here</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Calendar</h2>
            <button className="text-sm text-primary hover:text-primary/80 flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">New Year's Day</span>
                <span className="text-muted-foreground">Jan 1, 2024</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">MLK Day</span>
                <span className="text-muted-foreground">Jan 15, 2024</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">Presidents Day</span>
                <span className="text-muted-foreground">Feb 19, 2024</span>
              </div>
            </div>
            <button className="btn-primary w-full flex items-center justify-center">
              View Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
