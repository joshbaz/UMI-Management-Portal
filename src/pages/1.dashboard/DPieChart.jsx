import React from "react";
import { Cell, Label, Pie, PieChart } from "recharts";
import tinycolor from "tinycolor2";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import { ResponsiveContainer } from 'recharts';
import {
  ChartTooltip,
} from "@/components/ui/chart";
import { useGetStatusStatistics } from "@/store/tanstackStore/services/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define default data for when the real data is loading
const defaultChartData = [
  { status: "Normal Progress", students: 0, fill: '#22C55E' },
  { status: "Fieldwork", students: 0, fill: '#3B82F6' },
  { status: "Under Examination", students: 0, fill: '#EAB308' },
  { status: "Scheduled for Viva", students: 0, fill: '#EC4899' },
  { status: "Results Approved", students: 0, fill: '#14B8A6' }
];

const DPieChart = () => {
  // State for the selected category
  const [category, setCategory] = React.useState("main");
  
  // Fetch student status data with the selected category
  const { data, isLoading, error } = useGetStatusStatistics(category);

  // Transform the data for the chart
  const chartData = React.useMemo(() => {
    if (!data) return defaultChartData;

    // The API returns an array of objects with status, students, and fill
    return data
      .map(item => ({
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        students: item.students,
        fill: item.fill
      }))
      .filter(item => item.students > 0); // Only show non-zero values
  }, [data]);

  const totalStudents = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.students, 0);
  }, [chartData]);

  const getDarkerStroke = (fillColor) => {
    return tinycolor(fillColor).darken(15).toString();
  };
  
  const getLighterFill = (fillColor) => {
    return tinycolor(fillColor).lighten(15).toString();
  };

  if (error) {
    return (
      <Card className="flex flex-col h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-destructive">Failed to load student statistics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full mb-4">
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <div className="gap-0">
          <h3 className="text-md relative font-[Inter-Medium] text-gray-700">Status Distribution</h3>
          <p className="text-xs font-[Inter-Regular] text-muted-foreground">
            Current student status breakdown
          </p>
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px] text-sm font-[Inter-Regular] text-gray-900">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">Student Statuses</SelectItem>
            <SelectItem value="book">Dissertation Statuses</SelectItem>
            <SelectItem value="proposal">Proposal Statuses</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="w-full aspect-square max-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg bg-white p-2 shadow-md">
                        <p className="font-semibold">{data.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.students} students ({((data.students / totalStudents) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    );
                  }}
                />
                <Pie
                  data={chartData}
                  dataKey="students"
                  nameKey="status"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={2}
                  cx="50%"
                  cy="50%"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getLighterFill(entry.fill)}
                      stroke={getDarkerStroke(entry.fill)}
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox) return null;
                      const { cx, cy } = viewBox;
                      return (
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={cx}
                            y={cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {totalStudents}
                          </tspan>
                          <tspan
                            x={cx}
                            y={cy + 20}
                            className="fill-muted-foreground text-sm"
                          >
                            Total Students
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        {!isLoading && chartData.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-1">
            {chartData.map((entry, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div
                  className="w-3 h-3 rounded-full mt-1"
                   style={{ backgroundColor: entry.fill }}
                />
                <div className="flex flex-col w-full">
                  <span className="text-sm font-[Inter-Regular] text-gray-900">
                    {entry.status}
                  </span>
                  <span className="text-xs font-[Inter-Regular] text-muted-foreground">
                    {entry.students} ({((entry.students / totalStudents) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DPieChart;
