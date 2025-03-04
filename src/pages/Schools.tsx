import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, MapPin, Phone, Globe, Users, School2, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { School } from '../types/school';

const GradeChip: React.FC<{ grade: string }> = ({ grade }) => (
  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-secondary rounded-md">
    {grade}
  </span>
);

const StatusBadge: React.FC<{ status: School['status'] }> = ({ status }) => {
  const colors = {
    'Opened': 'bg-emerald-50 text-emerald-700',
    'Closed': 'bg-red-50 text-red-700',
    'Under Review': 'bg-amber-50 text-amber-700'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
};

const Schools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof School>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [view, setView] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schools')
        .select(`
          *,
          grades:school_grades(*),
          tags:school_tags(*),
          operation_details:school_operation_details(*),
          meal_options:school_meal_options(*)
        `)
        .order('name');

      if (error) throw error;
      setSchools(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: keyof School) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSchools = [...filteredSchools].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    return 0;
  });

  const paginatedSchools = sortedSchools.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredSchools.length / rowsPerPage);

  const TableView = () => (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer">
                <div className="flex items-center gap-2" onClick={() => handleSort('name')}>
                  Name
                  <ChevronDown className="w-4 h-4" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Code</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Enrollment</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Grade Levels</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSchools.map((school) => (
              <tr key={school.id} className="border-b hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{school.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {school.address}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{school.code}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={school.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium">{school.current_enrollment}</div>
                  {school.operation_details && (
                    <div className="text-xs text-muted-foreground">
                      Capacity: {school.operation_details.student_capacity}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {school.grades?.map((g) => (
                      <GradeChip key={g.grade} grade={g.grade} />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/schools/${school.id}`}
                      className="p-2 hover:bg-secondary rounded-full text-primary"
                      title="View Details"
                    >
                      <School2 className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/contacts?school=${school.id}`}
                      className="p-2 hover:bg-secondary rounded-full text-primary"
                      title="View Contacts"
                    >
                      <Users className="w-4 h-4" />
                    </Link>
                    <button className="p-2 hover:bg-secondary rounded-full">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 flex items-center justify-between border-t">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="bg-background border rounded-md text-sm p-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredSchools.length)} of {filteredSchools.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md hover:bg-secondary disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md hover:bg-secondary disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {paginatedSchools.map((school) => (
        <div key={school.id} className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium text-foreground">{school.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Code: {school.code}</p>
              </div>
              <StatusBadge status={school.status} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {school.address}
              </div>

              {school.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {school.phone}
                </div>
              )}

              {school.website && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <a href={school.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    Website
                  </a>
                </div>
              )}

              {school.parent_organization && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  {school.parent_organization}
                </div>
              )}

              <div className="pt-3 border-t">
                <div className="text-sm font-medium mb-2">Grade Levels</div>
                <div className="flex flex-wrap gap-1">
                  {school.grades?.map((g) => (
                    <GradeChip key={g.grade} grade={g.grade} />
                  ))}
                </div>
              </div>

              {school.operation_details && (
                <div className="pt-3 border-t">
                  <div className="text-sm font-medium mb-2">Details</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Enrollment</div>
                      <div className="font-medium">{school.current_enrollment}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Capacity</div>
                      <div className="font-medium">{school.operation_details.student_capacity}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Class Size</div>
                      <div className="font-medium">{school.operation_details.class_size}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Teacher Ratio</div>
                      <div className="font-medium">{school.operation_details.teacher_to_student_ratio}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-secondary/20 flex justify-between items-center">
            <div className="flex gap-2">
              <Link
                to={`/schools/${school.id}`}
                className="text-primary hover:text-primary/80"
              >
                View Details
              </Link>
            </div>
            <button className="p-2 hover:bg-secondary rounded-full">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Schools</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-secondary rounded-lg p-1">
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                view === 'table' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
              }`}
            >
              TABLE VIEW
            </button>
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                view === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
              }`}
            >
              GRID VIEW
            </button>
          </div>
          <button className="btn-primary">
            Add School
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search schools..."
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

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      ) : view === 'table' ? (
        <TableView />
      ) : (
        <GridView />
      )}
    </div>
  );
};

export default Schools;
