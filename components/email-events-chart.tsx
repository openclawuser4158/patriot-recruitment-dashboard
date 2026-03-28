'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ChartData {
  date: string
  sent: number
  opened: number
  clicked: number
  bounced: number
}

interface EmailEventsChartProps {
  data: ChartData[]
}

export function EmailEventsChart({ data }: EmailEventsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[#6B7280]">
        No data for the selected period
      </div>
    )
  }

  // Format date labels
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} />
        <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend
          iconType="square"
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="sent" name="Sent" fill="#1B2A4A" radius={[2, 2, 0, 0]} />
        <Bar dataKey="opened" name="Opened" fill="#10B981" radius={[2, 2, 0, 0]} />
        <Bar dataKey="clicked" name="Clicked" fill="#3B82F6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="bounced" name="Bounced" fill="#EF4444" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
