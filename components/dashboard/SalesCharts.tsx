"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface SalesChartsProps {
  dailySales: { date: string; revenue: number; transactions: number }[]
  monthlySales: { month: string; revenue: number }[]
}

export function SalesCharts({ dailySales, monthlySales }: SalesChartsProps) {
  // Format dates for display
  const formattedDaily = dailySales.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })
  }))

  const formattedMonthly = monthlySales.map(m => {
    const [year, month] = m.month.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return {
      ...m,
      displayMonth: date.toLocaleDateString("th-TH", { month: "long", year: "numeric" })
    }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>ยอดขายรายวัน</CardTitle>
          <CardDescription>แนวโน้มยอดขายในแต่ละวัน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedDaily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09090b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#09090b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-neutral-800" />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(value) => `฿${value}`}
                  width={60}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), "ยอดขาย"]}
                  labelStyle={{ color: "#111827", fontWeight: "bold" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#09090b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>ยอดขายรายเดือน</CardTitle>
          <CardDescription>เปรียบเทียบยอดขายในแต่ละเดือน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedMonthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-neutral-800" />
                <XAxis 
                  dataKey="displayMonth" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(value) => `฿${value}`}
                  width={60}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), "ยอดขาย"]}
                  labelStyle={{ color: "#111827", fontWeight: "bold" }}
                  cursor={{ fill: "#f3f4f6", className: "dark:fill-neutral-800" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#09090b" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
