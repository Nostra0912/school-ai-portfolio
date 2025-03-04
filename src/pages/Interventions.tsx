/**
 * Interventions Page Component
 * Provides a modern interface for managing school interventions with list, kanban and grid views
 */
import React, { useState } from 'react';
import { Search, Filter, ChevronDown, Plus, Users, FileText, AlertTriangle, Info, LayoutGrid, Kanban, List, ChevronRight } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { InterventionLevel } from '../types/school';

/**
 * Intervention interface defining the structure of an intervention record
 */
interface Intervention {
  id: string;
  schoolName: string;
  riskScore: number;
  level: InterventionLevel;
  contacts?: number;
  documents?: number;
  alerts?: number;
  info?: number;
}

// Mock data for development/testing
const mockInterventions: Intervention[] = [
  {
    id: '1',
    schoolName: 'Academy 360',
    riskScore: 2,
    level: 'Informal Contact',
    contacts: 2,
    documents: 1,
    alerts: 1,
    info: 0
  },
  {
    id: '2',
    schoolName: 'DSST: Elevate Northeast High School',
    riskScore: 18,
    level: 'Initial Contact',
    contacts: 4,
    documents: 2,
    alerts: 1,
    info: 1
  },
  {
    id: '3',
    schoolName: 'Colorado High School Charter - GES',
    riskScore: 136,
    level: 'Improvement Plan',
    contacts: 6,
    documents: 4,
    alerts: 2,
    info: 3
  },
  {
    id: '4',
    schoolName: 'Rocky Mountain Prep - Federal',
    riskScore: 246,
    level: 'Notice of Concern',
    contacts: 8,
    documents: 6,
    alerts: 4,
    info: 2
  },
  {
    id: '5',
    schoolName: 'Rocky Mountain Prep - RISE',
    riskScore: 352,
    level: 'Revocation of Contract / Non-Renewal',
    contacts: 12,
    documents: 8,
    alerts: 6,
    info: 4
  }
];

// Define available intervention levels
const interventionLevels: InterventionLevel[] = [
  'Informal Contact',
  'Initial Contact',
  'Improvement Plan',
  'Notice of Concern',
  'Revocation of Contract / Non-Renewal'
];

type ViewType = 'kanban' | 'grid' | 'list';

/**
 * Get background color for intervention level
 */
const getLevelColor = (level: InterventionLevel): string => {
  const colors: Record<InterventionLevel, string> = {
    'Informal Contact': 'bg-gray-100',
    'Initial Contact': 'bg-amber-50',
    'Improvement Plan': 'bg-orange-50',
    'Notice of Concern': 'bg-rose-50',
    'Revocation of Contract / Non-Renewal': 'bg-red-50'
  };
  return colors[level];
};

/**
 * Get border color for intervention level
 */
const getLevelBorderColor = (level: InterventionLevel): string => {
  const colors: Record<InterventionLevel, string> = {
    'Informal Contact': 'border-gray-200',
    'Initial Contact': 'border-amber-200',
    'Improvement Plan': 'border-orange-200',
    'Notice of Concern': 'border-rose-200',
    'Revocation of Contract / Non-Renewal': 'border-red-200'
  };
  return colors[level];
};

interface InterventionCardProps {
  intervention: Intervention;
  onLevelChange: (id: string, level: InterventionLevel) => void;
}

/**
 * InterventionCard Component
 * Displays a draggable card with intervention details
 */
const InterventionCard: React.FC<InterventionCardProps> = ({ intervention, onLevelChange }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'intervention',
    item: { id: intervention.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-white rounded-lg shadow-sm p-4 mb-3 cursor-move border-l-4 
        ${getLevelBorderColor(intervention.level)} 
        hover:shadow-md transition-shadow
        ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-foreground">{intervention.schoolName}</h3>
        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
          {intervention.riskScore}
        </span>
      </div>
      <div className="flex gap-4 text-muted-foreground">
        {intervention.contacts && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">{intervention.contacts}</span>
          </div>
        )}
        {intervention.documents && (
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs">{intervention.documents}</span>
          </div>
        )}
        {intervention.alerts && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">{intervention.alerts}</span>
          </div>
        )}
        {intervention.info && (
          <div className="flex items-center gap-1">
            <Info className="w-4 h-4" />
            <span className="text-xs">{intervention.info}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Column Component
 * Displays a droppable column for a specific intervention level
 */
const Column: React.FC<{
  level: InterventionLevel;
  interventions: Intervention[];
  onLevelChange: (id: string, level: InterventionLevel) => void;
}> = ({ level, interventions, onLevelChange }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'intervention',
    drop: (item: { id: string }) => {
      onLevelChange(item.id, level);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`${getLevelColor(level)} rounded-lg p-4 min-w-[300px] ${
        isOver ? 'ring-2 ring-primary/20' : ''
      }`}
    >
      <h2 className="font-medium text-foreground mb-4">{level}</h2>
      <div className="space-y-3">
        {interventions
          .filter(intervention => intervention.level === level)
          .map(intervention => (
            <InterventionCard
              key={intervention.id}
              intervention={intervention}
              onLevelChange={onLevelChange}
            />
          ))}
      </div>
    </div>
  );
};

/**
 * GridView Component
 * Displays interventions in a grid layout
 */
const GridView: React.FC<{
  interventions: Intervention[];
  onLevelChange: (id: string, level: InterventionLevel) => void;
}> = ({ interventions, onLevelChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {interventions.map(intervention => (
      <InterventionCard
        key={intervention.id}
        intervention={intervention}
        onLevelChange={onLevelChange}
      />
    ))}
  </div>
);

/**
 * ListView Component
 * Displays interventions in a modern list layout with collapsible sections
 */
const ListView: React.FC<{
  interventions: Intervention[];
  onLevelChange: (id: string, level: InterventionLevel) => void;
}> = ({ interventions, onLevelChange }) => {
  // Group interventions by level
  const groupedInterventions = interventionLevels.reduce((acc, level) => {
    acc[level] = interventions.filter(i => i.level === level);
    return acc;
  }, {} as Record<InterventionLevel, Intervention[]>);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    Object.fromEntries(interventionLevels.map(level => [level, true]))
  );

  const toggleSection = (level: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  return (
    <div className="space-y-4">
      {interventionLevels.map(level => (
        <div key={level} className="bg-white rounded-lg shadow-sm">
          {/* Section Header */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection(level)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-1 h-6 rounded-full ${getLevelColor(level).replace('bg-gray-100', 'bg-gray-300')}`} />
              <h3 className="font-medium flex items-center gap-2">
                {level}
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {groupedInterventions[level].length}
                </span>
              </h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
              expandedSections[level] ? 'transform rotate-180' : ''
            }`} />
          </div>

          {/* Section Content */}
          {expandedSections[level] && (
            <div className="border-t">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500">School</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500">Risk Score</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500">Contacts</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500">Documents</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500">Alerts</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500">Info</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {groupedInterventions[level].map((intervention, idx) => (
                    <tr 
                      key={intervention.id}
                      className={`hover:bg-gray-50 ${
                        idx !== groupedInterventions[level].length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{intervention.schoolName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {intervention.riskScore}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-500">
                          <Users className="w-4 h-4 mr-1" />
                          {intervention.contacts}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-500">
                          <FileText className="w-4 h-4 mr-1" />
                          {intervention.documents}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-500">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {intervention.alerts}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-500">
                          <Info className="w-4 h-4 mr-1" />
                          {intervention.info}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-500">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * KanbanView Component
 * Displays interventions in a kanban board layout
 */
const KanbanView: React.FC<{
  interventions: Intervention[];
  onLevelChange: (id: string, level: InterventionLevel) => void;
}> = ({ interventions, onLevelChange }) => (
  <div className="grid grid-cols-5 gap-4 overflow-x-auto min-h-[calc(100vh-12rem)]">
    {interventionLevels.map((level) => (
      <Column
        key={level}
        level={level}
        interventions={interventions}
        onLevelChange={onLevelChange}
      />
    ))}
  </div>
);

const Interventions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [interventions, setInterventions] = useState(mockInterventions);
  const [view, setView] = useState<ViewType>('list'); // Changed default to list view

  const handleLevelChange = (id: string, newLevel: InterventionLevel) => {
    setInterventions(prevInterventions =>
      prevInterventions.map(intervention =>
        intervention.id === id
          ? { ...intervention, level: newLevel }
          : intervention
      )
    );
  };

  // Filter interventions based on search term
  const filteredInterventions = interventions.filter(intervention =>
    intervention.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-foreground">Interventions</h1>
          <div className="flex items-center gap-4">
            <div className="flex bg-secondary rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-md transition-colors ${
                  view === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('kanban')}
                className={`p-2 rounded-md transition-colors ${
                  view === 'kanban' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
              >
                <Kanban className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-md transition-colors ${
                  view === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Intervention
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search interventions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Views */}
        {view === 'kanban' && (
          <KanbanView
            interventions={filteredInterventions}
            onLevelChange={handleLevelChange}
          />
        )}
        {view === 'grid' && (
          <GridView
            interventions={filteredInterventions}
            onLevelChange={handleLevelChange}
          />
        )}
        {view === 'list' && (
          <ListView
            interventions={filteredInterventions}
            onLevelChange={handleLevelChange}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default Interventions;
