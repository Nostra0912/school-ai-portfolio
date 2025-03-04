/**
 * Layout Component
 * 
 * A comprehensive layout component that provides the main structure for the application,
 * including a sidebar navigation, header with profile management, and content area.
 * 
 * Features:
 * - Responsive sidebar navigation with categorized menu items
 * - Header with language selection, notifications, and profile management
 * - Profile dropdown with district selection and user settings
 * - Dynamic route highlighting for active navigation items
 * 
 * @component
 * @example
 * return (
 *   <Layout>
 *     <YourPageContent />
 *   </Layout>
 * )
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  GraduationCap, 
  FileText, 
  Calendar, 
  Users,
  MessageSquare,
  ClipboardCheck,
  BookOpen,
  Building2,
  FileBox,
  Users2,
  School2,
  FileSpreadsheet,
  AppWindow,
  Workflow,
  FolderKanban,
  Bell,
  Settings,
  History,
  BookTemplate,
  FileCheck,
  ScrollText,
  CheckSquare,
  FileEdit,
  LogOut,
  User,
  Building,
  ChevronDown
} from 'lucide-react';

// Types for menu items structure
interface MenuItem {
  icon: React.ReactElement;
  label: string;
  path: string;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  // State management for profile menu and district selection
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("Denver Public Schools - Authorizing & Accountability");

  // Available districts for selection
  const districts = [
    "Denver Public Schools - Authorizing & Accountability",
    "Jefferson County School District",
    "Aurora Public Schools",
    "Cherry Creek School District"
  ];

  // Navigation menu structure with categorized items
  const menuItems: MenuSection[] = [
    { section: 'OVERVIEW', items: [
      { icon: <LayoutGrid size={20} />, label: 'Dashboard', path: '/' },
    ]},
    { section: 'SCHOOL PORTFOLIO', items: [
      { icon: <GraduationCap size={20} />, label: 'Schools', path: '/schools' },
      { icon: <FileText size={20} />, label: 'Interventions', path: '/interventions' },
      { icon: <Calendar size={20} />, label: 'Calendar', path: '/calendar' },
      { icon: <Users size={20} />, label: 'Contacts', path: '/contacts' },
    ]},
    { section: 'APPLICATIONS', items: [
      { icon: <ScrollText size={20} />, label: 'Applications', path: '/applications' },
      { icon: <FileEdit size={20} />, label: 'Templates', path: '/applications/templates' },
      { icon: <CheckSquare size={20} />, label: 'Reviews', path: '/applications/reviews' },
    ]},
    { section: 'DOCUMENT MANAGEMENT', items: [
      { icon: <FolderKanban size={20} />, label: 'Categories', path: '/documents/categories' },
      { icon: <BookTemplate size={20} />, label: 'Templates', path: '/documents/templates' },
      { icon: <FileText size={20} />, label: 'Documents', path: '/documents' },
      { icon: <History size={20} />, label: 'Version History', path: '/documents/versions' },
    ]},
    { section: 'APPROVALS & NOTIFICATIONS', items: [
      { icon: <FileCheck size={20} />, label: 'Approval Workflows', path: '/approvals/workflows' },
      { icon: <ClipboardCheck size={20} />, label: 'My Approvals', path: '/approvals/tasks' },
      { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications' },
      { icon: <Settings size={20} />, label: 'Notification Settings', path: '/notifications/settings' },
    ]},
    { section: 'WORKFLOWS', items: [
      { icon: <Workflow size={20} />, label: 'Workflows', path: '/workflows' },
    ]},
    { section: 'INTEGRATED TOOLS', items: [
      { icon: <MessageSquare size={20} />, label: 'Complaint Resolution', path: '/complaints' },
      { icon: <BookOpen size={20} />, label: 'Directory Connect', path: '/directory' },
      { icon: <Building2 size={20} />, label: 'Knowledge Base', path: '/knowledge' },
      { icon: <FileBox size={20} />, label: 'Storage Zone', path: '/storage' },
      { icon: <Users2 size={20} />, label: 'Family Circle', path: '/family' },
      { icon: <School2 size={20} />, label: 'Forms', path: '/forms' },
      { icon: <FileSpreadsheet size={20} />, label: 'Application Hub', path: '/applications' },
    ]},
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-card shadow-lg z-20">
        {/* Logo and Branding */}
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="flex items-center">
              {/* Custom SVG logo using simple geometric shapes */}
              <svg width="32" height="32" viewBox="0 0 200 200" className="text-primary">
                <rect x="40" y="120" width="120" height="20" fill="currentColor" />
                <rect x="60" y="100" width="80" height="20" fill="currentColor" />
                <rect x="80" y="60" width="40" height="40" fill="currentColor" />
              </svg>
              <span className="text-xl font-semibold text-primary ml-2">Anvilar</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-medium text-muted-foreground mb-3 px-3">
                {section.section}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link
                      to={item.path}
                      className={`nav-item ${
                        location.pathname === item.path
                          ? 'nav-item-active'
                          : 'nav-item-inactive'
                      }`}
                    >
                      {React.cloneElement(item.icon, {
                        className: location.pathname === item.path ? 'text-primary' : 'text-gray-500'
                      })}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Header with User Controls */}
        <header className="h-16 bg-card border-b flex items-center justify-end px-6 shadow-sm sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            {/* Language Selection */}
            <select className="px-3 py-1.5 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>🇺🇸 English</option>
            </select>

            {/* Notification Badge */}
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <span className="sr-only">Notifications</span>
              <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <span className="text-xs">3</span>
              </div>
            </button>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">MU</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Profile Dropdown Content */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 border z-50">
                  {/* User Information Section */}
                  <div className="px-4 py-3 border-b">
                    <div className="font-medium text-gray-900">Mark Usher</div>
                    <div className="text-sm text-gray-500">mark.usher@example.com</div>
                  </div>

                  {/* District Selection Section */}
                  <div className="px-4 py-3 border-b">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Current District
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Profile Menu Actions */}
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile Settings
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Organization Settings
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
