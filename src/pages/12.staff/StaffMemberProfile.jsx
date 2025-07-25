import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar, Mail, Phone, MapPin, Building, GraduationCap, Briefcase, User, Globe } from 'lucide-react';

const StaffMemberProfile = ({ staffMember }) => {
  const getRoleBadgeColor = (role) => {
    const colors = {
      SUPERVISOR: 'bg-blue-100 text-blue-800',
      EXAMINER: 'bg-green-100 text-green-800',
      REVIEWER: 'bg-purple-100 text-purple-800',
      PANELIST: 'bg-orange-100 text-orange-800',
      CHAIRPERSON: 'bg-red-100 text-red-800',
      EXTERNAL_EXAMINER: 'bg-indigo-100 text-indigo-800',
      RESEARCH_COORDINATOR: 'bg-teal-100 text-teal-800',
      THESIS_ADVISOR: 'bg-pink-100 text-pink-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInstitutionalInfo = (member) => {
    if (member.isExternal) {
      return {
        title: 'External Institution Information',
        icon: <Globe className="h-5 w-5" />,
        fields: [
          { label: 'Institution', value: member.externalInstitution },
          { label: 'Department', value: member.externalDepartment },
          { label: 'Location', value: member.externalLocation }
        ]
      };
    } else {
      return {
        title: 'Institutional Affiliation',
        icon: <Building className="h-5 w-5" />,
        fields: [
          { label: 'Campus', value: member.campus?.name },
          { label: 'School', value: member.school?.name },
          { label: 'Department', value: member.department?.name }
        ]
      };
    }
  };

  if (!staffMember) {
    return <div>Loading...</div>;
  }

  const institutionalInfo = getInstitutionalInfo(staffMember);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Staff Member Profile</h2>
        <p className="text-muted-foreground">
          Detailed information about {staffMember.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Header */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={staffMember.profileImage} />
                  <AvatarFallback className="text-lg">
                    {getInitials(staffMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-2xl font-bold">{staffMember.name}</h3>
                    <Badge variant={staffMember.isActive ? "default" : "secondary"}>
                      {staffMember.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {staffMember.isExternal && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        External
                      </Badge>
                    )}
                  </div>
                  {staffMember.title && (
                    <p className="text-lg text-muted-foreground">{staffMember.title}</p>
                  )}
                  {staffMember.designation && (
                    <p className="text-muted-foreground">{staffMember.designation}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{staffMember.email}</span>
                    </div>
                    {staffMember.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{staffMember.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Institutional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {institutionalInfo.icon}
              <span>{institutionalInfo.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {institutionalInfo.fields.map((field, index) => (
              field.value && (
                <div key={index}>
                  <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
                  <p className="font-medium">{field.value}</p>
                </div>
              )
            ))}
            {staffMember.specialization && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                <p className="font-medium">{staffMember.specialization}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Professional Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {staffMember.qualifications && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualifications</p>
                <p className="text-sm">{staffMember.qualifications}</p>
              </div>
            )}
            {staffMember.experience && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Experience</p>
                <p className="text-sm">{staffMember.experience}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bio */}
        {staffMember.bio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Biography</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{staffMember.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{formatDate(staffMember.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm">{formatDate(staffMember.updatedAt)}</p>
            </div>
            {staffMember.createdBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                <p className="text-sm">{staffMember.createdBy.name}</p>
              </div>
            )}
            {staffMember.updatedBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated By</p>
                <p className="text-sm">{staffMember.updatedBy.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Related Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {staffMember.supervisor && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supervisor Record</p>
                <p className="text-sm">Linked to supervisor profile</p>
              </div>
            )}
            {staffMember.examiner && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Examiner Record</p>
                <p className="text-sm">Linked to examiner profile</p>
              </div>
            )}
            {staffMember.reviewer && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reviewer Record</p>
                <p className="text-sm">Linked to reviewer profile</p>
              </div>
            )}
            {staffMember.panelist && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Panelist Record</p>
                <p className="text-sm">Linked to panelist profile</p>
              </div>
            )}
            {!staffMember.supervisor && !staffMember.examiner && !staffMember.reviewer && !staffMember.panelist && (
              <p className="text-sm text-muted-foreground">No related records found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffMemberProfile; 