import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Filter, Building, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useGetStaffMembers, useDeleteStaffMember } from '../../store/tanstackStore/services/queries';
import AddStaffMember from './AddStaffMember';
import EditStaffMember from './EditStaffMember';
import StaffMemberProfile from './StaffMemberProfile';

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStaffMember, setSelectedStaffMember] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [lastTriggerElement, setLastTriggerElement] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const {
    data: staffMembers = [],
    isLoading,
    error,
    refetch
  } = useGetStaffMembers(searchTerm, statusFilter);

  const deleteStaffMemberMutation = useDeleteStaffMember();

  const handleDeleteStaffMember = async (id) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }
    deleteStaffMemberMutation.mutate(id);
  };

  const handleStaffMemberAdded = () => {
    setShowAddDialog(false);
    setSelectedStaffMember(null);
    refetch();
    toast.success('Staff member added successfully');
  };

  const handleStaffMemberUpdated = () => {
    setShowEditDialog(false);
    setSelectedStaffMember(null);
    refetch();
    toast.success('Staff member updated successfully');
  };

  const handleAddDialogCancel = () => {
    setShowAddDialog(false);
    setSelectedStaffMember(null);
  };

  const handleEditDialogCancel = () => {
    setShowEditDialog(false);
    setSelectedStaffMember(null);
  };

  const handleProfileDialogClose = () => {
    setShowProfileDialog(false);
    setSelectedStaffMember(null);
    // Clear focus and restore to body to prevent aria-hidden issues
    setTimeout(() => {
      document.body.focus();
      if (lastTriggerElement) {
        lastTriggerElement.focus();
      }
    }, 100);
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
    setSelectedStaffMember(null);
    // Clear focus and restore to body to prevent aria-hidden issues
    setTimeout(() => {
      document.body.focus();
      if (lastTriggerElement) {
        lastTriggerElement.focus();
      }
    }, 100);
  };

  const handleAddDialogClose = () => {
    setShowAddDialog(false);
    setSelectedStaffMember(null);
  };

  // Clean up selected staff member when dialogs are closed
  useEffect(() => {
    if (!showAddDialog && !showEditDialog && !showProfileDialog) {
      setSelectedStaffMember(null);
      setLastTriggerElement(null);
      setOpenDropdownId(null);
    }
  }, [showAddDialog, showEditDialog, showProfileDialog]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getInstitutionalInfo = (member) => {
    if (member.isExternal) {
      return {
        primary: member.externalInstitution || 'External Institution',
        secondary: member.externalDepartment || member.externalLocation || 'External',
        icon: <Globe className="h-4 w-4 text-blue-600" />
      };
    } else {
      return {
        primary: member.department?.name || member.school?.name || member.campus?.name || 'Internal',
        secondary: member.department ? `${member.school?.name || ''} ${member.campus?.name || ''}`.trim() : '',
        icon: <Building className="h-4 w-4 text-green-600" />
      };
    }
  };

  const filteredStaffMembers = staffMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.isExternal ? 
                           (member.externalInstitution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.externalDepartment?.toLowerCase().includes(searchTerm.toLowerCase())) :
                           (member.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.school?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.campus?.name?.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesSearch;
  });

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-muted-foreground">
              Manage academic staff members including supervisors, examiners, reviewers, and panelists.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600">Error loading staff members. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage academic staff members including supervisors, examiners, reviewers, and panelists.
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>
                View and manage all academic staff members
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Institutional Affiliation</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaffMembers.map((member) => {
                  const institutionalInfo = getInstitutionalInfo(member);
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={member.profileImage} />
                            <AvatarFallback>
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.title} {member.designation && `• ${member.designation}`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {institutionalInfo.icon}
                          <div>
                            <div className="font-medium">{institutionalInfo.primary}</div>
                            <div className="text-sm text-muted-foreground">
                              {institutionalInfo.secondary}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant={member.isActive ? "default" : "secondary"}>
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {member.isExternal && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              External
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu 
                          open={openDropdownId === member.id}
                          onOpenChange={(open) => {
                            setOpenDropdownId(open ? member.id : null);
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setLastTriggerElement(e.currentTarget.closest('button'));
                                setSelectedStaffMember(member);
                                setShowProfileDialog(true);
                                setOpenDropdownId(null);
                                // Force blur to prevent focus retention
                                setTimeout(() => {
                                  document.activeElement?.blur();
                                }, 0);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setLastTriggerElement(e.currentTarget.closest('button'));
                                setSelectedStaffMember(member);
                                setShowEditDialog(true);
                                setOpenDropdownId(null);
                                // Force blur to prevent focus retention
                                setTimeout(() => {
                                  document.activeElement?.blur();
                                }, 0);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteStaffMember(member.id)}
                              className="text-red-600"
                              disabled={deleteStaffMemberMutation.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {deleteStaffMemberMutation.isPending ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          
          {!isLoading && filteredStaffMembers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No staff members found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleAddDialogClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Add a new academic staff member to the system.
            </DialogDescription>
          </DialogHeader>
          <AddStaffMember onSuccess={handleStaffMemberAdded} onCancel={handleAddDialogCancel} />
        </DialogContent>
      </Dialog>

      {/* Edit Staff Member Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleEditDialogClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update staff member information.
            </DialogDescription>
          </DialogHeader>
          {selectedStaffMember && (
            <EditStaffMember 
              key={selectedStaffMember.id}
              staffMember={selectedStaffMember} 
              onSuccess={handleStaffMemberUpdated}
              onCancel={handleEditDialogCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Staff Member Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={handleProfileDialogClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Staff Member Profile</DialogTitle>
            <DialogDescription>
              View detailed information about the staff member.
            </DialogDescription>
          </DialogHeader>
          {selectedStaffMember && (
            <StaffMemberProfile 
              key={selectedStaffMember.id}
              staffMember={selectedStaffMember} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement; 