"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface OverviewProps {
    income: number;
    expense: number;
}

export function Overview({ income, expense }: OverviewProps) {
    // For now, we project the current month's data as a single bar
    // In a real scenario, we would fetch historical data
    const data = [
        {
            name: "Current Month",
            income: income,
            expense: expense,
        },
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                    cursor={{ fill: 'transparent' }}
                />
                <Bar
                    dataKey="income"
                    fill="#16a34a" // Green
                    name="Income"
                    radius={[4, 4, 0, 0]}
                    barSize={60}
                />
                <Bar
                    dataKey="expense"
                    fill="#dc2626" // Red
                    name="Expense"
                    radius={[4, 4, 0, 0]}
                    barSize={60}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
