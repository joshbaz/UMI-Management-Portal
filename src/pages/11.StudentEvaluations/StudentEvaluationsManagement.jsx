import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Star, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Filter,
  Download,
  Eye,
  Calendar,
  BarChart3
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  getFilteredRowModel
} from '@tanstack/react-table';
import { useGetEvaluationAnalytics, useGetDetailedEvaluations } from '../../store/tanstackStore/services/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const StudentEvaluationsManagement = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('last_12_months');
  const [selectedTrigger, setSelectedTrigger] = useState('all');
  const [selectedSatisfactionLevel, setSelectedSatisfactionLevel] = useState('all');
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Handle viewing evaluation details
  const handleViewDetails = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedEvaluation(null);
    setShowDetailsModal(false);
  };

  // Fetch evaluation analytics
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useGetEvaluationAnalytics();
  
  // Fetch detailed evaluations with filters
  const detailedParams = useMemo(() => {
    const params = {};
    if (selectedTrigger !== 'all') params.trigger = selectedTrigger;
    if (selectedSatisfactionLevel !== 'all') params.satisfactionLevel = selectedSatisfactionLevel;
    return params;
  }, [selectedTrigger, selectedSatisfactionLevel]);

  const { data: detailedData, isLoading: detailedLoading } = useGetDetailedEvaluations(detailedParams);

  // Extract data from analytics response
  const analytics = analyticsData?.data || {};
  const overview = analytics.overview || {};
  const trends = analytics.trends || [];
  const satisfactionDistribution = analytics.satisfactionDistribution || [];
  const recentEvaluations = analytics.recentEvaluations || [];

  // Colors for charts
  const COLORS = ['#23388F', '#3B82F6', '#EAB308', '#EC4899', '#14B8A6'];

  // Chart configurations
  const chartConfig = {
    researchTraining: { label: "Research Training", color: "#23388F" },
    supervision: { label: "Supervision", color: "#3B82F6" },
    proposalDefense: { label: "Proposal Defense", color: "#EAB308" },
    dissertationExamination: { label: "Dissertation Examination", color: "#EC4899" }
  };

  // Stats cards data
  const statsCards = useMemo(() => [
    {
      title: "Total Evaluations",
      value: overview.totalEvaluations || 0,
      icon: <Users className="h-4 w-4" />,
      description: "Completed evaluations"
    },
    {
      title: "Post-Proposal Defense",
      value: overview.evaluationsByTrigger?.find(item => item.trigger === 'POST_PROPOSAL_DEFENSE')?.count || 0,
      icon: <BarChart3 className="h-4 w-4" />,
      description: "After proposal defense"
    },
    {
      title: "Post-Viva",
      value: overview.evaluationsByTrigger?.find(item => item.trigger === 'POST_VIVA')?.count || 0,
      icon: <TrendingUp className="h-4 w-4" />,
      description: "After viva examination"
    },
    {
      title: "Average Rating",
      value: overview.averageRatings ? 
        (Number(overview.averageRatings.researchTraining) + Number(overview.averageRatings.supervision) + Number(overview.averageRatings.proposalDefense)) / 3 : 0,
      icon: <Star className="h-4 w-4" />,
      description: "Overall satisfaction",
      format: (value) => `${value.toFixed(1)}/5.0`
    }
  ], [overview]);

  // Memoize bar chart data
  const barChartData = useMemo(() => [
    { 
      category: 'Research Training', 
      rating: Number(overview.averageRatings?.researchTraining) || 0,
      color: chartConfig.researchTraining.color
    },
    { 
      category: 'Supervision', 
      rating: Number(overview.averageRatings?.supervision) || 0,
      color: chartConfig.supervision.color
    },
    { 
      category: 'Proposal Defense', 
      rating: Number(overview.averageRatings?.proposalDefense) || 0,
      color: chartConfig.proposalDefense.color
    },
    { 
      category: 'Dissertation Exam', 
      rating: Number(overview.averageRatings?.dissertationExamination) || 0,
      color: chartConfig.dissertationExamination.color
    }
  ], [overview.averageRatings]);

  // Satisfaction level mapping
  const satisfactionLevelMap = {
    'VERY_DISSATISFIED': { label: 'Very Dissatisfied', color: '#EF4444', value: 1 },
    'DISSATISFIED': { label: 'Dissatisfied', color: '#F97316', value: 2 },
    'NEUTRAL': { label: 'Neutral', color: '#EAB308', value: 3 },
    'SATISFIED': { label: 'Satisfied', color: '#22C55E', value: 4 },
    'VERY_SATISFIED': { label: 'Very Satisfied', color: '#16A34A', value: 5 }
  };

  // Table column helper - memoized to prevent recreation
  const columnHelper = useMemo(() => createColumnHelper(), []);

  // Define table columns
  const columns = useMemo(() => [
    columnHelper.accessor('student.name', {
      header: 'Student Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('student.email', {
      header: 'Email',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('trigger', {
      header: 'Evaluation Type',
      cell: info => (
        <Badge variant="outline">
          {info.getValue() === 'POST_PROPOSAL_DEFENSE' ? 'Post-Proposal' : 'Post-Viva'}
        </Badge>
      ),
    }),
    columnHelper.accessor('submittedAt', {
      header: 'Submitted',
      cell: info => format(new Date(info.getValue()), 'MMM dd, yyyy'),
    }),
    columnHelper.accessor('ratings.researchTraining', {
      header: 'Research Training',
      cell: info => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-current text-yellow-500" />
          <span>{satisfactionLevelMap[info.getValue()]?.value || 0}</span>
        </div>
      ),
    }),
    columnHelper.accessor('ratings.supervision', {
      header: 'Supervision',
      cell: info => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-current text-yellow-500" />
          <span>{satisfactionLevelMap[info.getValue()]?.value || 0}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetails(row.original)}
          className="h-8 px-2 text-xs"
        >
          <Eye className="h-3 w-3 mr-1" />
          Open
        </Button>
      ),
    }),
  ], [satisfactionLevelMap]);

  // Memoize table data
  const tableData = useMemo(() => {
    return detailedData?.data?.evaluations || [];
  }, [detailedData?.data?.evaluations]);

  // Table configuration
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (analyticsLoading) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading evaluation analytics...</div>
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading evaluation analytics</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between py-6 px-6 pb-0 w-full h-[64px]">
        <p className="text-sm font-[Inter-Medium] text-gray-900">Management Portal</p>
        <p className="text-sm font-[Inter-Medium] text-gray-600">Digital Research Information Management System</p>
      </div>

      {/* Horizontal Line */}
      <div className="my-6 border-t border-gray-200"></div>

      {/* Page Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Student Satisfaction Evaluations</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and analyze student feedback on research processes</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {format(new Date(), 'MM-dd-yyyy hh:mm:ssaa')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 mb-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.format ? stat.format(stat.value) : stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 mb-6">
        {/* Satisfaction Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Satisfaction Trends Over Time</CardTitle>
            <CardDescription>Average satisfaction ratings by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[0, 5]}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {label}
                                </span>
                                {payload.map((entry, index) => (
                                  <span key={index} className="font-bold text-muted-foreground">
                                    {entry.name}: {entry.value}/5
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="researchTrainingAvg" 
                    stroke={chartConfig.researchTraining.color}
                    name="Research Training"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="supervisionAvg" 
                    stroke={chartConfig.supervision.color}
                    name="Supervision"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="proposalDefenseAvg" 
                    stroke={chartConfig.proposalDefense.color}
                    name="Proposal Defense"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Average Ratings Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Average Satisfaction by Category</CardTitle>
            <CardDescription>Overall ratings across all evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[0, 5]}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}/5`, 'Rating']}
                  />
                  <Bar 
                    dataKey="rating" 
                    fill="#23388F"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Evaluations Table */}
      <div className="px-6 pb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Evaluations</CardTitle>
                <CardDescription>Latest student satisfaction evaluations</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Evaluations</SelectItem>
                    <SelectItem value="POST_PROPOSAL_DEFENSE">Post-Proposal Defense</SelectItem>
                    <SelectItem value="POST_VIVA">Post-Viva</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center py-4">
              <input
                placeholder="Search evaluations..."
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className="max-w-sm px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b bg-gray-50">
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="h-12 px-4 text-left align-middle font-medium text-gray-900 text-sm">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-gray-50">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="p-4 align-middle text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="h-24 text-center">
                        No evaluations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-gray-500">
                Showing {table.getFilteredRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} evaluations
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluation Details Modal */}
      {showDetailsModal && selectedEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Evaluation Details
                </h2>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Student Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-sm text-gray-900">{selectedEvaluation.student?.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-sm text-gray-900">{selectedEvaluation.student?.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Student Number:</span>
                    <p className="text-sm text-gray-900">{selectedEvaluation.student?.studentNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Program:</span>
                    <p className="text-sm text-gray-900">{selectedEvaluation.student?.program}</p>
                  </div>
                </div>
              </div>

              {/* Evaluation Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Evaluation Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <Badge variant="outline" className="ml-2">
                      {selectedEvaluation.trigger === 'POST_PROPOSAL_DEFENSE' ? 'Post-Proposal Defense' : 'Post-Viva'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Submitted:</span>
                    <p className="text-sm text-gray-900">{format(new Date(selectedEvaluation.submittedAt), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>

              {/* Satisfaction Ratings */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Satisfaction Ratings</h3>
                <div className="space-y-3">
                  {[
                    { key: 'researchTraining', label: 'Research Training' },
                    { key: 'supervision', label: 'Supervision' },
                    { key: 'proposalDefense', label: 'Proposal Defense' },
                    { key: 'dissertationExamination', label: 'Dissertation Examination' }
                  ].map(({ key, label }) => {
                    const rating = selectedEvaluation.ratings?.[key];
                    if (!rating) return null;
                    
                    return (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{label}:</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= (satisfactionLevelMap[rating]?.value || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({satisfactionLevelMap[rating]?.label})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comments */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Comments & Feedback</h3>
                <div className="space-y-4">
                  {[
                    { key: 'researchTraining', label: 'Research Training Comments' },
                    { key: 'supervision', label: 'Supervision Comments' },
                    { key: 'proposalDefense', label: 'Proposal Defense Comments' },
                    { key: 'dissertationExamination', label: 'Dissertation Examination Comments' },
                    { key: 'overall', label: 'Overall Comments' },
                    { key: 'suggestions', label: 'Suggestions for Improvement' }
                  ].map(({ key, label }) => {
                    const comment = selectedEvaluation.comments?.[key];
                    if (!comment) return null;
                    
                    return (
                      <div key={key} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{label}:</h4>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{comment}</p>
                      </div>
                    );
                  })}
                  
                  {!Object.values(selectedEvaluation.comments || {}).some(comment => comment) && (
                    <p className="text-sm text-gray-500 italic">No comments provided for this evaluation.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end">
                <Button onClick={handleCloseDetails} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEvaluationsManagement; 