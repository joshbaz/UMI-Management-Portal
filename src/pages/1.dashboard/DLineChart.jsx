import React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
  views: {
    label: "Page Views",
  },
  desktop: {
    label: "Desktop",
    color: "#23388F",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
}  

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartData = [
  { date: "2024-04-01", desktop: 0,  },
  { date: "2024-04-02", desktop: 97,  },
  { date: "2024-04-03", desktop: 167,  },
  { date: "2024-04-04", desktop: 242,  },
  { date: "2024-04-05", desktop: 373,  },
  { date: "2024-04-06", desktop: 301,  },
  { date: "2024-04-07", desktop: 245,  },
  { date: "2024-04-08", desktop: 409,  },
  
]

const DLineChart = () => {
   const [timeRange, setTimeRange] = React.useState("90d")
   const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })
  return (
    <Card className="flex flex-col h-full">
    <CardHeader className="flex items-center  gap-2 space-y-0 border-b py-5 sm:flex-row">
      
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger
          className="w-[160px] rounded-lg sm:mr-auto"
          aria-label="Select a value"
        >
          <SelectValue placeholder="Last 3 months" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="90d" className="rounded-lg">
            Last 3 months
          </SelectItem>
          <SelectItem value="30d" className="rounded-lg">
            Last 30 days
          </SelectItem>
          <SelectItem value="7d" className="rounded-lg">
            Last 7 days
          </SelectItem>
        </SelectContent>
      </Select>
    </CardHeader>
    <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[250px] w-full"
      >
        <AreaChart data={filteredData}>
         
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }}
          />
          <YAxis
            dataKey="desktop"
            type="number"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              return `${value}`
            }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
                indicator="dot"
              />
            }
          />
          <Area
            dataKey="mobile"
            type="natural"
            fill="url(#fillMobile)"
            stroke="var(--color-mobile)"
            stackId="a"
          />
          <Area
            dataKey="desktop"
            type="linear"
            fill="url(#fillDesktop)"
            stroke="var(--color-desktop)"
            stackId="a"
          />
         
        </AreaChart>
      </ChartContainer>
    </CardContent>
  </Card>
  )
}

export default DLineChart