import React from "react";
import { Cell, Label, LabelList, Pie, PieChart } from "recharts";
import tinycolor from "tinycolor2";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StudentProgressPieChart = ({ studentsData }) => {
  const chartData = [
    {
      id: "Normal Progress",
      label: "Normal Progress", 
      students: studentsData.filter(s => s.status.toLowerCase() === "normal progress").length,
      fill: studentsData.find(s => s.status.toLowerCase() === "normal progress")?.statusColor || "#CCFBF1" // teal fallback
    },
    {
      id: "Book Submitted",
      label: "Book Submitted",
      students: studentsData.filter(s => s.status.toLowerCase() === "book submitted").length,
      fill: studentsData.find(s => s.status.toLowerCase() === "book submitted")?.statusColor || "#FFFBEB" // yellow fallback
    },
    {
      id: "Under Examination",
      label: "Under Examination",
      students: studentsData.filter(s => s.status.toLowerCase() === "under examination").length,
      fill: studentsData.find(s => s.status.toLowerCase() === "under examination")?.statusColor || "#F0F9FF" // blue fallback
    }
  ];

  const chartConfig = {
    students: {
      label: "Students",
    },
  };

  const totalStudents = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.students, 0);
  }, [chartData]);

  const getDarkerStroke = (fillColor) => {
    return fillColor;
  };

  const getLighterFill = (fillColor) => {
    return tinycolor(fillColor).lighten(40).toString();
  };

  return (
    <div className="h-full w-full">
      <Card className="h-full border-none shadow-none pb-4">
        <CardHeader className="items-start pb-0">
        <h3 className="text-lg font-[Roboto-Medium] text-gray-900 ">
            Progress Status
          </h3>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
               
                content={<ChartTooltipContent hideLabel  />}
              />
              <Pie
                data={chartData}
                dataKey="students"
                nameKey="label"
                innerRadius={60}
                strokeWidth={2}
                stroke={(data) => getDarkerStroke(data.fill)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getLighterFill(entry.fill)}
                    stroke={getDarkerStroke(entry.fill)}
                  />
                ))}

                <LabelList
                  dataKey="students"
                  className="fill-current text-foreground"
                  stroke="none"
                  fontSize={12}
                  formatter={(value) => value.toLocaleString()}
                />

                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalStudents.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Students
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="flex flex-row flex-wrap gap-1 items-start pb-0">
            {chartData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full "
                  style={{ backgroundColor: entry.fill }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">
                    {entry.label}: {entry.students}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProgressPieChart;
