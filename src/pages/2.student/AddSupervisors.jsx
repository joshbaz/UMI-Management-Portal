import React, { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Plus, X, ArrowLeft, Building, Globe } from "lucide-react";
import { toast } from "sonner";
import { useGetStaffMembers } from '@/store/tanstackStore/services/queries'
import { queryClient } from "@/utils/tanstack";
import { assignSupervisorsToStudentService } from "@/store/tanstackStore/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddStaffMember from '../12.staff/AddStaffMember';

const AddSupervisors = () => {
  const navigate = useNavigate();
  const { id: studentId } = useParams(); // Get student ID from URL params
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem("pageSize")) || 10
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem("currentPage")) || 1
  );
  const [selectedPersonnel, setSelectedPersonnel] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch staff members data only
  const { data: staffMembersData, isLoading, refetch } = useGetStaffMembers();

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get institutional information
  const getInstitutionalInfo = (member) => {
    // Handle different possible institution data structures
    let primary = "Not specified";
    let secondary = "";
    
    if (member.school) {
      // Handle school information (this is the actual data structure we have)
      if (typeof member.school === 'string') {
        primary = member.school;
      } else if (typeof member.school === 'object' && member.school.name) {
        primary = member.school.name;
      }
    } else if (member.institution) {
      if (typeof member.institution === 'string') {
        primary = member.institution;
      } else if (typeof member.institution === 'object' && member.institution.name) {
        primary = member.institution.name;
      } else if (typeof member.institution === 'object') {
        primary = member.institution.id || member.institution.code || "Institution";
      }
    } else if (member.organization) {
      primary = member.organization;
    } else if (member.campus) {
      // Use campus as fallback if no institution/school data
      if (typeof member.campus === 'string') {
        primary = member.campus;
      } else if (typeof member.campus === 'object' && member.campus.name) {
        primary = member.campus.name;
      }
    }
    
    // Handle secondary information
    if (member.department) {
      if (typeof member.department === 'string') {
        secondary = member.department;
      } else if (typeof member.department === 'object' && member.department.name) {
        secondary = member.department.name;
      }
    } else if (member.faculty) {
      secondary = member.faculty;
    } else if (member.school && typeof member.school === 'object' && member.school.department) {
      secondary = member.school.department;
    } else if (member.institution && typeof member.institution === 'object' && member.institution.department) {
      secondary = member.institution.department;
    }
    
    let icon = <Building className="h-4 w-4 text-muted-foreground" />;
    if (member.isExternal) {
      icon = <Globe className="h-4 w-4 text-blue-600" />;
    }
    
    return { primary, secondary, icon };
  };

  // Mock data for student and supervisors
  const studentData = { student: { name: "John Doe" } };
  const currentSupervisors = { supervisors: [] };

  // Mutation for assigning supervisors
  const addSupervisorsMutation = useMutation({
    mutationKey: ["AssignSupervisors"],
    mutationFn: () => {
      const personnelIds = selectedPersonnel.map(person => person.id);
      return assignSupervisorsToStudentService(studentId, personnelIds);
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Personnel assigned successfully", {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => toast.dismiss()
        }
      });
      
      queryClient.resetQueries({ queryKey: ['student', studentId] });
      setShowConfirmDialog(false);
      navigate(-1);
    },
    onError: (error) => {
      console.error("Error assigning personnel:", error);
      toast.error(error?.message || "Error assigning personnel. Please try again.", {
        duration: 40000,
        action: {
          label: "Close",
          onClick: () => toast.dismiss()
        }
      });
    }
  });

  // Handle staff member added
  const handleStaffMemberAdded = () => {
    setShowAddDialog(false);
    refetch();
    toast.success('Staff member added successfully');
  };

  // Handle add dialog cancel
  const handleAddDialogCancel = () => {
    setShowAddDialog(false);
  };

  // Save pagination state to localStorage
  useEffect(() => {
    localStorage.setItem("pageSize", pageSize);
    localStorage.setItem("currentPage", currentPage);
  }, [pageSize, currentPage]);

  // Filter staff members based on search
  const filteredPersonnel = useMemo(() => {
    const staffMembers = staffMembersData || [];
    
    // Combine and normalize the data
    const allPersonnel = staffMembers.map(staff => ({
      ...staff,
      type: 'staff',
      displayName: staff.name,
      displayEmail: staff.email,
      displayPhone: staff.phone,
      displayCampus: staff.campus?.name
    }));
    
    if (!searchTerm) return allPersonnel;
    
    return allPersonnel.filter((person) => {
      const matchesSearch =
        person.displayName
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        person.displayEmail?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      
      return matchesSearch;
    });
  }, [staffMembersData, searchTerm]);

  // Debug: Log the first staff member to see the data structure
  useEffect(() => {
    if (staffMembersData && staffMembersData.length > 0) {
      console.log('First staff member data structure:', staffMembersData[0]);
      console.log('All available fields:', Object.keys(staffMembersData[0]));
      console.log('Institution field:', staffMembersData[0].institution);
      console.log('School field:', staffMembersData[0].school);
      console.log('Organization field:', staffMembersData[0].organization);
    }
  }, [staffMembersData]);

  // Pagination logic with useMemo
  const paginatedStaffMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    let paginatedData = filteredPersonnel.slice(
      startIndex,
      startIndex + pageSize
    );

    if (paginatedData.length === 0 && filteredPersonnel.length > 0) {
      // Reset the current page when the selected page size is too large for the available data
      setCurrentPage(1);
      paginatedData = filteredPersonnel.slice(0, pageSize);
    }

    return paginatedData;
  }, [filteredPersonnel, currentPage, pageSize]);

  console.log('staff members', staffMembersData)

  const handleAssignToggle = (person) => {
    setSelectedPersonnel(prev => {
      const isSelected = prev.find(r => r.id === person.id);
      if (isSelected) {
        return prev.filter(r => r.id !== person.id);
      } else {
        return [...prev, person];
      }
    });
  };

  const handleSave = () => {
    if (selectedPersonnel.length > 0) {
      setShowConfirmDialog(true);
    }
  };

  const confirmAssignment = () => {
    addSupervisorsMutation.mutate();
    // setShowConfirmDialog(false);
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredPersonnel.length / pageSize);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="p-6 border-b min-h-[90px] border-gray-300 w-full"></div>

      {/* Control Panel */}
      <div className="px-6 py-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Button>
              <div className="flex flex-col">
                <span className="text-lg font-medium text-gray-900">
                  Student: {studentData?.student?.name || "Loading..."}
                </span>
                <span className="text-sm font-[Inter-Medium] capitalize text-gray-600">
                  Assign staff members to this student
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assign Staff Members</CardTitle>
                <CardDescription>
                  Select staff members to assign as supervisors to this student. 
                  {selectedPersonnel.length > 0 && (
                    <span className="ml-2 text-sm text-blue-600">
                      ({selectedPersonnel.length}) Selected
                    </span>
                  )}
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Staff Member
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
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
                    <TableHead>Campus</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStaffMembers.length > 0 ? (
                    paginatedStaffMembers.map((person) => {
                      const isSelected = selectedPersonnel.some(
                        (r) => r.id === person.id
                      );
                      const institutionalInfo = getInstitutionalInfo(person);
                      
                      // Safety check: ensure we have valid data
                      if (!person || typeof person !== 'object') {
                        return null;
                      }
                      
                      return (
                        <TableRow key={person.id} className={isSelected ? 'bg-blue-50' : ''}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={person.profileImage} />
                                <AvatarFallback>
                                  {getInitials(person.displayName || person.name || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{person.displayName || person.name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {person.title} {person.designation && `• ${person.designation}`}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {institutionalInfo.icon}
                              <div>
                                <div className="font-medium">{String(institutionalInfo.primary || 'Not specified')}</div>
                                <div className="text-sm text-muted-foreground">
                                  {String(institutionalInfo.secondary || '')}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{person.displayEmail || person.email || 'No email'}</div>
                              <div className="text-sm text-muted-foreground">
                                {person.displayPhone || person.phone || 'No phone'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {person.displayCampus || person.campus?.name || "Not specified"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge variant={person.isActive ? "default" : "secondary"}>
                                {person.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {person.isExternal && (
                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                  External
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleAssignToggle(person)}
                              variant={isSelected ? "destructive" : "default"}
                              size="sm"
                            >
                              {isSelected ? 'Unassign' : 'Assign'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }).filter(Boolean) // Remove any null entries
                  ) : (
                    <TableRow>
                      <TableCell colSpan="6" className="text-center py-8">
                        <div className="text-muted-foreground">
                          <p className="text-sm font-medium">No staff members found</p>
                          <p className="text-xs mt-1">Please add a new staff member or adjust your search criteria</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {!isLoading && filteredPersonnel.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(filteredPersonnel.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredPersonnel.length, currentPage * pageSize)} of {filteredPersonnel.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    First
                  </Button>
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages).keys()].map((page) => (
                      <Button
                        key={page + 1}
                        onClick={() => handlePageChange(page + 1)}
                        variant={currentPage === page + 1 ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                      >
                        {page + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                  <Button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    variant="outline"
                    size="sm"
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center items-center gap-4 pt-8">
          <Button 
            onClick={handleSave}
            disabled={selectedPersonnel.length === 0 || addSupervisorsMutation.isPending}
            size="lg"
            className="min-w-[200px]"
          >
            {addSupervisorsMutation.isPending ? 'Saving...' : 'Save Assignments'}
          </Button>
        </div>
      </div>

      {/* Add Staff Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90%] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Personnel Assignment</h3>
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                You are about to assign the following personnel to this student:
              </p>
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                {selectedPersonnel.map((person) => (
                  <div key={person.id} className="py-2 px-3 mb-1 bg-blue-50 rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">{person.displayName || person.name}</div>
                      <div className="text-sm text-gray-500">{person.displayEmail || person.email}</div>
                    </div>
                    <button 
                      onClick={() => handleAssignToggle(person)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowConfirmDialog(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAssignment}
                disabled={addSupervisorsMutation.isPending}
              >
                {addSupervisorsMutation.isPending ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSupervisors;