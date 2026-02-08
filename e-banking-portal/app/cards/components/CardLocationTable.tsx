import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { MapPin } from "lucide-react"

const usageData = [
    {
        id: 1,
        cardName: "Diamond Platinum Black",
        cardNumber: "22211xxxxxxx90G",
        location: "Milan, Italy",
        date: "2 mins ago"
    },
    {
        id: 2,
        cardName: "MasterCard Gold Limited",
        cardNumber: "800111xxxxxxx00A",
        location: "Istanbul, Turkey",
        date: "2 hours ago"
    },
    {
        id: 3,
        cardName: "Visa Infinite Metal",
        cardNumber: "4532xxxxxxx9012",
        location: "New York, USA",
        date: "1 day ago"
    }
]

export function CardLocationTable() {
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Recent Usage Locations
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Card Details</TableHead>
                            <TableHead className="text-right">Location</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usageData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{item.cardName}</span>
                                        <span className="text-xs text-muted-foreground font-mono">{item.cardNumber}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm">{item.location}</span>
                                        <span className="text-xs text-muted-foreground">{item.date}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
