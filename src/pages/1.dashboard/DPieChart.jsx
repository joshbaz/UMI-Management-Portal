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

const chartData = [
  { status: "Normal Progress", students: 32, fill: "#CCFBF1" },
  { status: "Workshop", students: 14, fill: "#F0F9FF" },
  { status: "Book Submitted", students: 10, fill: "#FFFBEB" },
  { status: "Under Examination", students: 9, fill: "#F0F9FF" },
];

const chartConfig = {
  students: {
    label: "Students",
  },
};

const DPieChart = () => {
  const totalStudents = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.students, 0);
  }, []);

  const getDarkerStroke = (fillColor) => {
    return tinycolor(fillColor).darken(50).toString(); // Darken by 20%
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <Select value={"status report"}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:mr-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="status report" className="rounded-lg">
              status report
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1  pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="students"
              nameKey="status"
              innerRadius={60}
              strokeWidth={2}
              stroke={(data) => getDarkerStroke(data.fill)}
              // label={({ payload, ...props }) => {
              //   return (
              //     <text
              //       cx={props.cx}
              //       cy={props.cy}
              //       x={props.x}
              //       y={props.y}
              //       textAnchor={props.textAnchor}
              //       dominantBaseline={props.dominantBaseline}
              //       fill="black text-foreground"
              //       className='flex text-[8px] !z-50'
              //     >
              //       {payload.status}
              //     </text>
              //   )
              // }}
              // labelLine={true}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill} // Set original fill color
                  stroke={getDarkerStroke(entry.fill)} // Apply dynamically darker stroke
                  label={entry.status}
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

        <div className="flex flex-row flex-wrap gap-2 items-center justify-evenly">
          {chartData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full "
                style={{ backgroundColor: getDarkerStroke(entry.fill) }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">
                  {entry.status}: {entry.students}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DPieChart;
