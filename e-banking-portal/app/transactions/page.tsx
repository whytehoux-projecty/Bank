'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api-client';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    Download,
    Calendar,
    X,
    Edit2,
    Check,
    Briefcase,
    DollarSign,
    TrendingDown,
    TrendingUp
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { VintageIcon } from '@/components/ui/vintage-icon';

const categories = [
    'General', 'Income', 'Shopping', 'Dining', 'Utilities',
    'Transportation', 'Health', 'Transfer', 'Interest',
    'Groceries', 'Entertainment', 'Services'
];

function TransactionsContent() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [editingTxId, setEditingTxId] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await api.transactions.getAll({ limit: 100 });
            setTransactions(response.transactions || []);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCategory = async (txId: string) => {
        if (!editingCategory) return;
        try {
            await api.transactions.updateCategory(txId, editingCategory);
            setTransactions(prev => prev.map(tx =>
                tx.id === txId ? { ...tx, category: editingCategory } : tx
            ));
            setEditingTxId(null);
        } catch (error) {
            console.error('Failed to update category', error);
        }
    };

    const startEditing = (tx: any) => {
        setEditingTxId(tx.id);
        setEditingCategory(tx.category || 'General');
    };

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = (transaction.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || transaction.category === selectedCategory;
        const txDate = new Date(transaction.createdAt || transaction.date);
        const matchesDateFrom = !dateFrom || txDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || txDate <= new Date(dateTo);
        return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
    });

    const totalIncome = filteredTransactions
        .filter(t => t.type === 'DEPOSIT' || Number(t.amount) > 0)
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = filteredTransactions
        .filter(t => t.type === 'WITHDRAWAL' || Number(t.amount) < 0)
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setDateFrom('');
        setDateTo('');
    };

    // CSV Export Logic (Hidden from UI but available via function)
    const handleExport = () => {
        // Implementation remains same as before conceptually
        const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredTransactions.map(tx => [
                new Date(tx.createdAt || tx.date).toLocaleDateString(),
                `"${tx.description}"`,
                tx.type,
                tx.category || 'Uncategorized',
                tx.amount,
                tx.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                </div>
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-charcoal">Transactions</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track your financial history.
                    </p>
                </div>
                <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
                    Export CSV
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-row items-center justify-between p-6">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                        <h2 className="text-2xl font-bold mt-1 text-charcoal">{filteredTransactions.length}</h2>
                    </div>
                    <VintageIcon icon={Briefcase} variant="charcoal" size="lg" />
                </Card>
                <Card className="flex flex-row items-center justify-between p-6 bg-gradient-to-br from-vintage-green/10 to-transparent border-vintage-green/20">
                    <div>
                        <p className="text-sm font-medium text-vintage-green-dark">Total Income</p>
                        <h2 className="text-2xl font-bold mt-1 text-vintage-green font-mono">
                            +{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalIncome)}
                        </h2>
                    </div>
                    <VintageIcon icon={TrendingUp} variant="green" size="lg" />
                </Card>
                <Card className="flex flex-row items-center justify-between p-6 bg-gradient-to-br from-red-50 to-transparent border-red-100">
                    <div>
                        <p className="text-sm font-medium text-red-700">Total Expenses</p>
                        <h2 className="text-2xl font-bold mt-1 text-red-600 font-mono">
                            -{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalExpenses)}
                        </h2>
                    </div>
                    <VintageIcon icon={TrendingDown} variant="gold" size="lg" /> {/* Gold usage for contrast/vintage feel, or create Red variant if preferred */}
                </Card>
            </div>

            {/* Filters & Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <CardTitle>History</CardTitle>

                        {/* Search & Filter Toggles */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button
                                variant={showFilters ? "primary" : "outline"}
                                size="small"
                                className="h-10"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Expandable Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Categories</SelectItem>
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">From Date</label>
                                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">To Date</label>
                                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <Button variant="ghost" size="small" className="w-full text-muted-foreground hover:text-destructive" onClick={handleClearFilters}>
                                    Clear All filters
                                </Button>
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <div className="flex justify-center w-8">
                                                {Number(tx.amount) > 0 ? (
                                                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {tx.description}
                                            <div className="text-xs text-muted-foreground md:hidden mt-0.5">
                                                {new Date(tx.createdAt || tx.date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {editingTxId === tx.id ? (
                                                <div className="flex items-center gap-1">
                                                    <Select value={editingCategory} onValueChange={setEditingCategory}>
                                                        <SelectTrigger className="h-7 w-[130px] text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button variant="ghost" size="small" className="h-7 w-7 p-0 text-green-600" onClick={() => handleUpdateCategory(tx.id)}>
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="small" className="h-7 w-7 p-0 text-red-600" onClick={() => setEditingTxId(null)}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="group flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => startEditing(tx)}
                                                >
                                                    <Badge variant="outline" className="font-normal text-muted-foreground group-hover:border-primary group-hover:text-primary">
                                                        {tx.category || 'Uncategorized'}
                                                    </Badge>
                                                    <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(tx.createdAt || tx.date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className={`text-right font-mono font-semibold ${Number(tx.amount) > 0 ? 'text-green-600' : 'text-foreground'}`}>
                                            {Number(tx.amount) > 0 ? '+' : ''}
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(tx.amount))}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'default'} className="text-[10px]">
                                                {tx.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        }>
            <TransactionsContent />
        </Suspense>
    );
}
