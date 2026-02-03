'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import {
    Shield,
    Snowflake,
    CreditCard,
    Globe,
    Lock,
    Eye,
    EyeOff,
    Plus,
    RefreshCw,
    Link as LinkIcon,
    Settings,
    MoreHorizontal
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { VisualCard } from '@/components/ui/visual-card';
import { VintageIcon } from '@/components/ui/vintage-icon';

// New Sub-components
import { CardExpenseChart } from '@/app/cards/components/CardExpenseChart';
import { CardLocationTable } from '@/app/cards/components/CardLocationTable';
import { CreditScore } from '@/app/cards/components/CreditScore';
import { CardDetailsDialog } from '@/app/cards/components/CardDetailsDialog';

// Mock Data
const cards = [
    {
        id: 'c1',
        name: 'John Doe',
        number: '4532 1234 5678 9012',
        expiry: '12/28',
        cvc: '123',
        type: 'metal',
        scheme: 'visa',
        tier: 'Infinite',
        balance: 2450.50,
        limit: 10000,
        status: 'active',
        frozen: false,
        settings: {
            onlinePayments: true,
            internationalUsage: true,
            contactless: true
        }
    },
    {
        id: 'c2',
        name: 'John Doe',
        number: '5412 7512 3412 3456',
        expiry: '09/26',
        cvc: '456',
        type: 'gold',
        scheme: 'mastercard',
        tier: 'World Elite',
        balance: 450.00,
        limit: 5000,
        status: 'active',
        frozen: true,
        settings: {
            onlinePayments: true,
            internationalUsage: false,
            contactless: true
        }
    }
];

export default function CardsPage() {
    const [selectedCardId, setSelectedCardId] = useState(cards[0].id);
    const [showPan, setShowPan] = useState(false);

    const activeCard = cards.find(c => c.id === selectedCardId) || cards[0];

    const toggleSetting = (setting: string) => {
        console.log(`Toggling ${setting} for card ${activeCard.id}`);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 animate-fade-in-up">

            {/* Header with Action Group */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-charcoal">Cards Center</h1>
                    <p className="text-muted-foreground mt-1">Manage your physical and virtual cards securely.</p>
                </div>

                {/* Logical Action Group: Apply, Replace, Link */}
                <div className="flex flex-wrap gap-3">
                    <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                        Apply for New Card
                    </Button>
                    <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
                        Replace Card
                    </Button>
                    <Button variant="outline" icon={<LinkIcon className="w-4 h-4" />}>
                        Attach External Card
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Visual Card, Selection & Vital Controls (5 cols) */}
                <div className="lg:col-span-5 space-y-8">

                    {/* The Visual Card Stage */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                                <CreditCard className="w-5 h-5" /> Selected Card
                            </h3>
                            <Badge variant={activeCard.frozen ? 'destructive' : 'success'}>
                                {activeCard.frozen ? 'Frozen' : 'Active'}
                            </Badge>
                        </div>

                        <div className="relative group perspective-1000">
                            <VisualCard
                                name={activeCard.name}
                                number={showPan ? activeCard.number : activeCard.number.replace(/\d{4} \d{4} \d{4}/, '**** **** ****')}
                                expiry={activeCard.expiry}
                                cvc={activeCard.cvc}
                                type={activeCard.type as any}
                                className="shadow-2xl hover:scale-[1.01] transition-transform duration-500"
                            />
                        </div>

                        {/* Contextual Controls for THIS card */}
                        <div className="flex items-center justify-between gap-2 p-2 bg-white/50 rounded-lg border border-white/60 shadow-sm backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="small"
                                    onClick={() => setShowPan(!showPan)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    {showPan ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                                    {showPan ? 'Hide Number' : 'Show Number'}
                                </Button>
                            </div>

                            {/* The "View Details" logic requested */}
                            <CardDetailsDialog card={activeCard} />
                        </div>
                    </div>

                    {/* Card Selector Loop */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Your Wallet</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-3">
                            {cards.map(card => (
                                <div
                                    key={card.id}
                                    onClick={() => setSelectedCardId(card.id)}
                                    className={`
                                        cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between group
                                        ${selectedCardId === card.id
                                            ? 'bg-vintage-green/5 border-vintage-green ring-1 ring-vintage-green shadow-sm'
                                            : 'bg-white border-border hover:border-vintage-green/30 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-8 rounded-md shadow-sm bg-gradient-to-r ${card.type === 'metal' ? 'from-gray-800 to-black' : 'from-yellow-200 to-yellow-500'}`}></div>
                                        <div>
                                            <p className="font-semibold text-charcoal text-sm">{card.scheme === 'visa' ? 'Visa' : 'Mastercard'} {card.tier}</p>
                                            <p className="text-xs text-muted-foreground font-mono">•••• {card.number.slice(-4)}</p>
                                        </div>
                                    </div>
                                    {selectedCardId === card.id && (
                                        <div className="h-2 w-2 rounded-full bg-vintage-green"></div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick Credit Score View */}
                    <CreditScore />

                </div>

                {/* Right Column: Advanced Analytics & Settings (7 cols) */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Data Visualization Row */}
                    <div className="grid grid-cols-1 gap-6">
                        <CardExpenseChart />
                    </div>

                    {/* Location & Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Transaction Locations */}
                        <div className="md:col-span-2">
                            <CardLocationTable />
                        </div>

                        {/* Security Controls */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <VintageIcon icon={Lock} size="sm" variant="charcoal" />
                                    Security & Permissions
                                </CardTitle>
                                <CardDescription>Control how {activeCard.tier} •••• {activeCard.number.slice(-4)} works.</CardDescription>
                            </CardHeader>
                            <CardContent className="divide-y divide-border">

                                <div className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Snowflake size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-charcoal text-sm">Freeze Card</p>
                                            <p className="text-xs text-muted-foreground">Temporarily block activity</p>
                                        </div>
                                    </div>
                                    <Switch checked={activeCard.frozen} onCheckedChange={() => toggleSetting('frozen')} />
                                </div>

                                <div className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-charcoal text-sm">Contactless</p>
                                            <p className="text-xs text-muted-foreground">Tap-to-pay limit: $100</p>
                                        </div>
                                    </div>
                                    <Switch checked={activeCard.settings.contactless} onCheckedChange={() => toggleSetting('contactless')} />
                                </div>

                                <div className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                            <Globe size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-charcoal text-sm">International</p>
                                            <p className="text-xs text-muted-foreground">Allow foreign transactions</p>
                                        </div>
                                    </div>
                                    <Switch checked={activeCard.settings.internationalUsage} onCheckedChange={() => toggleSetting('international')} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
