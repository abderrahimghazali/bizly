'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  IconUsers, 
  IconUser, 
  IconMail,
  IconChevronDown,
  IconChevronRight,
  IconUserCog,
  IconUsersGroup
} from '@tabler/icons-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/useAuth';

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Manager {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface TeamHierarchy {
  manager: Manager;
  employees: Employee[];
}

interface TeamData {
  hierarchy: TeamHierarchy[];
  stats: {
    total_managers: number;
    total_employees: number;
  };
}

export default function TeamManagementPage() {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedManagers, setExpandedManagers] = useState<Set<number>>(new Set());
  const [reassigning, setReassigning] = useState<number | null>(null);
  const [selectedManagers, setSelectedManagers] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/manager/team');
      setTeamData(response.data);
      // Expand all managers by default
      const managerIds = new Set(response.data.hierarchy.map((h: TeamHierarchy) => h.manager.id));
      setExpandedManagers(managerIds);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const toggleManagerExpansion = (managerId: number) => {
    const newExpanded = new Set(expandedManagers);
    if (newExpanded.has(managerId)) {
      newExpanded.delete(managerId);
    } else {
      newExpanded.add(managerId);
    }
    setExpandedManagers(newExpanded);
  };

  const handleReassignEmployee = async (employeeId: number, newManagerId: string) => {
    if (!newManagerId) return;

    try {
      setReassigning(employeeId);
      await apiClient.post('/manager/assign-employee', {
        employee_id: employeeId,
        manager_id: parseInt(newManagerId)
      });
      
      toast.success('Employee reassigned successfully');
      await fetchTeamData();
      // Clear the selected manager for this employee
      setSelectedManagers(prev => {
        const updated = { ...prev };
        delete updated[employeeId];
        return updated;
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reassign employee');
    } finally {
      setReassigning(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="text-center py-10">
          <IconUsers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No team data</h3>
          <p className="mt-1 text-sm text-gray-500">Failed to load team information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">


      {/* Team Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <IconUsers className="h-5 w-5" />
            <span>Team Hierarchy</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamData.hierarchy.map((team) => (
            <div key={team.manager.id} className="border rounded-lg p-4">
              {/* Manager Header */}
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => toggleManagerExpansion(team.manager.id)}
                >
                  {expandedManagers.has(team.manager.id) ? (
                    <IconChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <IconChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={team.manager.name} />
                    <AvatarFallback>{getInitials(team.manager.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{team.manager.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {team.manager.role}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(team.manager.status)}`}>
                        {team.manager.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <IconMail className="h-3 w-3 mr-1" />
                      {team.manager.email}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {team.employees.length} employee{team.employees.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Employees List */}
              {expandedManagers.has(team.manager.id) && (
                <div className="mt-4 ml-7 space-y-2">
                  {team.employees.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No employees assigned</p>
                  ) : (
                    team.employees.map((employee) => (
                      <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={employee.name} />
                            <AvatarFallback className="text-xs">{getInitials(employee.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{employee.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {employee.role}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(employee.status)}`}>
                                {employee.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center">
                              <IconMail className="h-2 w-2 mr-1" />
                              {employee.email}
                            </p>
                          </div>
                        </div>

                        {/* Reassign Button (Admin Only) */}
                        {user?.role === 'admin' && (
                          <div className="flex items-center space-x-2">
                            <Select
                              value={selectedManagers[employee.id] || ''}
                              onValueChange={(value) => setSelectedManagers(prev => ({ ...prev, [employee.id]: value }))}
                              disabled={reassigning === employee.id}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Reassign to..." />
                              </SelectTrigger>
                              <SelectContent>
                                {teamData.hierarchy
                                  .filter(h => h.manager.id !== team.manager.id)
                                  .map((h) => (
                                    <SelectItem key={h.manager.id} value={h.manager.id.toString()}>
                                      {h.manager.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => handleReassignEmployee(employee.id, selectedManagers[employee.id] || '')}
                              disabled={!selectedManagers[employee.id] || reassigning === employee.id}
                            >
                              {reassigning === employee.id ? 'Reassigning...' : 'Reassign'}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}