import React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
import { ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"
import { useGetProgressTrends } from "@/store/tanstackStore/services/queries"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"


const chartConfig = {
  submissions: {
    label: "Submissions",
    color: "#23388F",  // dark blue
  },
  examinations: {
    label: "Under Examination",
    color: "#EAB308",  // yellow
  },
  vivas: {
    label: "Viva Scheduled",
    color: "#EC4899",  // pink
  }
}  

// Dummy data for the chart when API data is not available
const dummyProgressData = [
  { date: "2023-01-01", submissions: 5, examinations: 2, vivas: 1 },
  { date: "2023-01-15", submissions: 7, examinations: 3, vivas: 2 },
  { date: "2023-02-01", submissions: 10, examinations: 5, vivas: 2 },
  { date: "2023-02-15", submissions: 12, examinations: 7, vivas: 3 },
  { date: "2023-03-01", submissions: 15, examinations: 8, vivas: 4 },
  { date: "2023-03-15", submissions: 18, examinations: 10, vivas: 5 },
  { date: "2023-04-01", submissions: 22, examinations: 12, vivas: 6 },
  { date: "2023-04-15", submissions: 25, examinations: 15, vivas: 7 },
  { date: "2023-05-01", submissions: 28, examinations: 18, vivas: 9 },
  { date: "2023-05-15", submissions: 32, examinations: 20, vivas: 10 },
  { date: "2023-06-01", submissions: 35, examinations: 22, vivas: 12 },
  { date: "2023-06-15", submissions: 38, examinations: 25, vivas: 14 },
];

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DLineChart = () => {
  const [timeRange, setTimeRange] = React.useState("90d")
  
  // Fetch student progress data using the query hook
  const { data: progressData, isLoading } = useGetProgressTrends(timeRange);

  // Use dummy data if API data is not available
  const chartData = progressData || [];
  console.log(chartData)

  // Get colors from the first data point if available
  const submissionsColor = progressData?.[0]?.submissionsColor || chartConfig.submissions.color;
  const examinationsColor = progressData?.[0]?.examinationsColor || chartConfig.examinations.color;
  const vivasColor = progressData?.[0]?.vivasColor || chartConfig.vivas.color;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 space-x-2  py-5 sm:flex-row">
        <div className="flex flex-col  gap-1">
          <CardTitle>Student Progress Trends</CardTitle>
          <CardDescription>Track student submissions and examinations over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:mr-auto"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-col h-full w-full pl-0  mx-0 items-center  justify-center ">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={submissionsColor} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={submissionsColor} stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorExaminations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={examinationsColor} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={examinationsColor} stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorVivas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={vivasColor} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={vivasColor} stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}`}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ 
                  paddingTop: "30px", 
                  gap: "50px", 
                  display: "flex", 
                  flexDirection: "row", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: "14px" 
                }}
                formatter={(value, entry, index) => {
                  return <span style={{ marginLeft: '0px', marginRight: '10px' }}>{value}</span>;
                }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg bg-white p-3 shadow-md border">
                      <p className="font-semibold mb-2">
                        {new Date(payload[0].payload.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                      {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm">
                            {entry.name}: {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="submissions"
                stroke={submissionsColor}
                fill="url(#colorSubmissions)"
                strokeWidth={2}
                name="Dessertation Submissions"
              />
              <Area
                type="monotone"
                dataKey="examinations"
                stroke={examinationsColor}
                fill="url(#colorExaminations)"
                strokeWidth={2}
                name="Under Examination"
              />
              <Area
                type="monotone"
                dataKey="vivas"
                stroke={vivasColor}
                fill="url(#colorVivas)"
                strokeWidth={2}
                name="Viva Scheduled"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default DLineChart