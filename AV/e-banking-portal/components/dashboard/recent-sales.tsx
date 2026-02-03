import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils";

interface Transaction {
    id: string;
    type: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
}

interface RecentTransactionsProps {
    transactions?: Transaction[];
}

export function RecentTransactions({ transactions = [] }: RecentTransactionsProps) {
    if (transactions.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No recent transactions
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {transactions.map((tx) => {
                const isPositive = tx.type === 'DEPOSIT' || (tx.type === 'TRANSFER' && tx.amount > 0);
                const amountColor = isPositive ? 'text-green-600' : 'text-red-600';
                const sign = isPositive ? '+' : '';

                return (
                    <div key={tx.id} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>
                                {tx.description.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none truncate max-w-[200px]">
                                {tx.description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className={`ml-auto font-medium ${amountColor}`}>
                            {sign}{formatCurrency(tx.amount)}
                        </div>
                    </div>
                );
            })}
        </div>
    )
}
