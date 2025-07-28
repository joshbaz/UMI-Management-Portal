import React, { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Plus, X, ArrowLeft, Building, Globe } from "lucide-react";
import { toast } from "sonner";
import { useGetBook, useGetStaffMembers } from "../../store/tanstackStore/services/queries";
import { assignExaminersToBookService } from "../../store/tanstackStore/services/api";
import { queryClient } from "@/utils/tanstack";
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

const GradeBookAddExternalExaminer = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get book ID from URL params
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem("pageSize")) || 10
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem("currentPage")) || 1
  );
  const [selectedExaminers, setSelectedExaminers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Query to fetch book details
  const { data: bookData, isLoading: isBookLoading, error: bookError } = useGetBook(id);
  
  // Query to fetch all staff members
  const { data: staffMembersData, isLoading: isStaffMembersLoading, error: staffMembersError, refetch } = useGetStaffMembers();
  console.log(staffMembersData)

  // Mutation for assigning examiners
  const assignExaminersMutation = useMutation({
    mutationFn: () => assignExaminersToBookService(id, selectedExaminers.map(examiner => examiner.id)),
    onSuccess: (data) => {
      toast.success(data?.message || "Examiners assigned successfully",{
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => toast.dismiss()
        }
      });
      queryClient.resetQueries({ queryKey: ['book', id] });
      navigate(-1);
    },
    onError: (error) => {
      console.error("Error assigning examiners:", error);
      toast.error(error?.message || "Error assigning examiners. Please try again.", {
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
    setShowModal(false);
    refetch();
    toast.success('Staff member added successfully');
  };

  // Handle add dialog cancel
  const handleAddDialogCancel = () => {
    setShowModal(false);
  };

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
    
    if (member.isExternal) {
      // For external staff members, use external institution fields
      primary = member.externalInstitution || "External Institution";
      secondary = member.externalDepartment || "";
    } else {
      // For internal staff members, use internal institution structure
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
      
      // Handle secondary information for internal staff
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
    }
    
    let icon = <Building className="h-4 w-4 text-muted-foreground" />;
    if (member.isExternal) {
      icon = <Globe className="h-4 w-4 text-blue-600" />;
    }
    
    return { primary, secondary, icon };
  };

  // Save pagination state to localStorage
  useEffect(() => {
    localStorage.setItem("pageSize", pageSize);
    localStorage.setItem("currentPage", currentPage);
  }, [pageSize, currentPage]);

  // Filter staff members based on search and external status
  const filteredStaffMembers = useMemo(() => {
    const staffMembers = staffMembersData || [];
    
    // Combine and normalize the data
    const allStaffMembers = staffMembers.map(staff => ({
      ...staff,
      type: 'staff',
      displayName: staff.name,
      displayEmail: staff.email,
      displayPhone: staff.phone,
      displayCampus: staff.campus?.name || staff.campus,
      displaySchool: staff.school?.name || staff.school,
      displayDepartment: staff.department?.name || staff.department,
      displayInstitution: staff.institution?.name || staff.institution,
      // For external staff members
      displayExternalInstitution: staff.externalInstitution,
      displayExternalDepartment: staff.externalDepartment,
      displayExternalLocation: staff.externalLocation
    }));
    
    if (!searchTerm) return allStaffMembers.filter(member => member.isExternal);
    
    return allStaffMembers.filter((member) => {
      const matchesSearch =
        member.displayName
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        member.displayEmail?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      
      // Only include external staff members
      const isExternal = member.isExternal === true;

      return matchesSearch && isExternal;
    });
  }, [staffMembersData, searchTerm]);

  // Pagination logic with useMemo
  const paginatedStaffMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    let paginatedData = filteredStaffMembers.slice(
      startIndex,
      startIndex + pageSize
    );

    if (paginatedData.length === 0 && filteredStaffMembers.length > 0) {
      // Reset the current page when the selected page size is too large for the available data
      setCurrentPage(1);
      paginatedData = filteredStaffMembers.slice(0, pageSize);
    }

    return paginatedData;
  }, [filteredStaffMembers, currentPage, pageSize]);

  const handleAssignToggle = (member) => {
    setSelectedExaminers(prev => {
      const isSelected = prev.find(e => e.id === member.id);
      if (isSelected) {
        return prev.filter(e => e.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleSave = () => {
    console.log(selectedExaminers);
    const staffMemberIds = selectedExaminers.map(examiner => examiner.id);
    console.log(staffMemberIds);
    assignExaminersMutation.mutate({ bookId: id, staffMemberIds });
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredStaffMembers.length / pageSize);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isBookLoading || isStaffMembersLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (bookError || staffMembersError) {
    return (
      <div className="p-6 text-red-500">
        Error loading data: {bookError?.message || staffMembersError?.message}
      </div>
    );
  }

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
                  Book: {bookData?.book?.title || "Loading..."}
                </span>
                <span className="text-sm font-[Inter-Medium] capitalize text-gray-600">
                  Student: {`${bookData?.book?.student?.firstName} ${bookData?.book?.student?.lastName}` || "Not Available"}
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
                <CardTitle>Assign External Staff Members</CardTitle>
                <CardDescription>
                  Select external staff members to assign as examiners to this book. 
                  {selectedExaminers.length > 0 && (
                    <span className="ml-2 text-sm text-blue-600">
                      ({selectedExaminers.length}) Selected
                    </span>
                  )}
                </CardDescription>
              </div>
              <Button onClick={() => setShowModal(true)}>
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
                  paginatedStaffMembers.map((member) => {
                    const isSelected = selectedExaminers.some(e => e.id === member.id);
                    const institutionalInfo = getInstitutionalInfo(member);
                    
                    // Safety check: ensure we have valid data
                    if (!member || typeof member !== 'object') {
                      return null;
                    }
                    
                    return (
                      <TableRow key={member.id} className={isSelected ? 'bg-blue-50' : ''}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.profileImage} />
                              <AvatarFallback>
                                {getInitials(member.displayName || member.name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.displayName || member.name || 'Unknown'}</div>
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
                              <div className="font-medium">
                                {member.isExternal 
                                  ? (member.displayExternalInstitution || 'External Institution')
                                  : (member.displaySchool || member.displayInstitution || institutionalInfo.primary || 'Not specified')
                                }
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.isExternal
                                  ? (member.displayExternalDepartment || '')
                                  : (member.displayDepartment || institutionalInfo.secondary || '')
                                }
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.displayEmail || member.email || 'No email'}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.displayPhone || member.phone || 'No phone'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {member.isExternal 
                              ? (member.displayExternalLocation || 'External Location')
                              : (member.displayCampus || member.campus?.name || member.campus || "Not specified")
                            }
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
                          <Button
                            onClick={() => handleAssignToggle(member)}
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
                        <p className="text-sm font-medium">No external staff members found</p>
                        <p className="text-xs mt-1">Please add a new staff member or adjust your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {filteredStaffMembers.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(filteredStaffMembers.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredStaffMembers.length, currentPage * pageSize)} of {filteredStaffMembers.length} entries
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
            disabled={selectedExaminers.length === 0 || assignExaminersMutation.isPending}
            size="lg"
            className="min-w-[200px]"
          >
            {assignExaminersMutation.isPending ? 'Saving...' : 'Save Assignments'}
          </Button>
        </div>
      </div>

      {/* Add Staff Member Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
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
    </div>
  );
};

export default GradeBookAddExternalExaminer;