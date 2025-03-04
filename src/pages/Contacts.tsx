import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, Pencil, MoreVertical, Mail, Phone, Building2, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSearchParams, Link } from 'react-router-dom';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  school: {
    id: string;
    name: string;
    address: string;
  };
  is_primary: boolean;
}

type ViewType = 'table' | 'card';

const Contacts = () => {
  const [searchParams] = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterSchool, setFilterSchool] = useState(searchParams.get('school') || '');
  const [schools, setSchools] = useState<any[]>([]);

  useEffect(() => {
    fetchContacts();
    fetchSchools();
  }, [filterSchool]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('contacts')
        .select(`
          *,
          school:schools(
            id,
            name,
            address
          )
        `)
        .order('last_name', { ascending: true });

      if (filterSchool) {
        query = query.eq('school_id', filterSchool);
      }

      const { data, error } = await query;

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const filteredContacts = contacts.filter(contact => {
    const searchMatch = 
      contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase());

    const roleMatch = !filterRole || contact.role === filterRole;

    return searchMatch && roleMatch;
  });

  const roles = Array.from(new Set(contacts.map(c => c.role))).sort();

  const TableView = () => (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">School</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="border-b hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {getInitials(contact.first_name, contact.last_name)}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {contact.first_name} {contact.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{contact.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{contact.role}</span>
                    {contact.is_primary && (
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-foreground">{contact.school?.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {contact.school?.address}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${contact.email}`} className="hover:text-primary">
                        {contact.email}
                      </a>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${contact.phone}`} className="hover:text-primary">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-secondary rounded-full">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </button>
                    <button className="p-2 hover:bg-secondary rounded-full">
                      <Pencil className="w-4 h-4 text-primary" />
                    </button>
                    <button className="p-2 hover:bg-secondary rounded-full">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredContacts.map((contact) => (
        <div key={contact.id} className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
                {getInitials(contact.first_name, contact.last_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground truncate">
                    {contact.first_name} {contact.last_name}
                  </h3>
                  {contact.is_primary && (
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{contact.role}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <Link to={`/schools/${contact.school?.id}`} className="hover:text-primary">
                  {contact.school?.name}
                </Link>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${contact.email}`} className="hover:text-primary truncate">
                  {contact.email}
                </a>
              </div>

              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${contact.phone}`} className="hover:text-primary">
                    {contact.phone}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {contact.school?.address}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-secondary/20 flex justify-end">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-secondary rounded-full">
                <MessageSquare className="w-4 h-4 text-primary" />
              </button>
              <button className="p-2 hover:bg-secondary rounded-full">
                <Pencil className="w-4 h-4 text-primary" />
              </button>
              <button className="p-2 hover:bg-secondary rounded-full">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Contacts</h1>
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
              onClick={() => setView('card')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                view === 'card' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
              }`}
            >
              CARD VIEW
            </button>
          </div>
          <button className="btn-primary">
            Add Contact
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <select
          value={filterSchool}
          onChange={(e) => setFilterSchool(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Schools</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>{school.name}</option>
          ))}
        </select>
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
        <CardView />
      )}
    </div>
  );
};

export default Contacts;
