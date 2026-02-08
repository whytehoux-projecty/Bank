"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { TrendingUp, Info } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell, Label } from "recharts"

const scoreData = [
    { name: "Score", value: 785 },
    { name: "Remaining", value: 215 }, // Assuming max 1000
]
const COLORS = ['#7D9B7B', '#E5E7EB'] // Vintage Green and Gray

export function CreditScore() {
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-medium">Credit Score</CardTitle>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
                <div className="h-[160px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={scoreData}
                                cx="50%"
                                cy="80%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="score" fill={COLORS[0]} />
                                <Cell key="remaining" fill={COLORS[1]} />
                                <Label
                                    value={scoreData[0].value}
                                    position="centerBottom"
                                    className="fill-foreground text-3xl font-bold font-mono"
                                    dy={-20}
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-0 w-full text-center">
                        <p className="text-sm text-muted-foreground font-medium">Excellent</p>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-vintage-green bg-vintage-green/10 px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12 points since last month</span>
                </div>
            </CardContent>
        </Card>
    )
}
