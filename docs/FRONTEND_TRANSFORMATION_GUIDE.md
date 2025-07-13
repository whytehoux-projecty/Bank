# Frontend Transformation Guide
## NovaBank → Aurum Vault Luxury Banking Portal

### 🎯 Overview

This guide outlines the complete frontend transformation of NovaBank into a luxury banking platform with Aurum Vault's premium design system, advanced features, and enterprise-grade user experience.

---

## 🎨 Design System Transformation

### Current vs Target State

| Aspect | NovaBank (Current) | Aurum Vault (Target) |
|--------|-------------------|---------------------|
| **Color Palette** | Teal/Green + Deep Blue | Navy/Gold + Slate Premium |
| **Typography** | Standard Inter | Luxury font hierarchy |
| **Components** | Basic Shadcn/UI | Premium enhanced components |
| **Effects** | Minimal | Glassmorphism + Neumorphism |
| **Animations** | Basic | Sophisticated micro-interactions |
| **Layout** | Standard grid | Luxury spatial design |

### New Color System Implementation

```typescript
// tailwind.config.ts - Updated Configuration
export default {
  theme: {
    extend: {
      colors: {
        // Primary Aurum Vault Palette
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a1929',
        },
        gold: {
          50: '#fffdf7',
          100: '#fffaeb',
          200: '#fff3c4',
          300: '#ffe888',
          400: '#ffd43b',
          500: '#ffbe0b',
          600: '#e09f00',
          700: '#a67c00',
          800: '#8b6914',
          900: '#735a1a',
          950: '#422f0c',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Semantic Colors
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      
      // Luxury Effects
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'gold-glow': '0 0 20px rgba(255, 190, 11, 0.3)',
        'navy-depth': '0 10px 40px rgba(16, 42, 67, 0.4)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
      },
      
      // Premium Gradients
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #102a43 0%, #334e68 100%)',
        'gold-gradient': 'linear-gradient(135deg, #ffbe0b 0%, #e09f00 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      
      // Typography Scale
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
      },
      
      // Spacing Scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
} satisfies Config;
```

---

## 🏗️ Component Architecture Upgrade

### Enhanced Component Library

```typescript
// components/ui/luxury-card.tsx
interface LuxuryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'gradient';
  glow?: boolean;
  children: React.ReactNode;
}

export function LuxuryCard({ 
  variant = 'glass', 
  glow = false, 
  className, 
  children, 
  ...props 
}: LuxuryCardProps) {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-2xl border backdrop-blur-sm transition-all duration-300',
        
        // Variant styles
        {
          'bg-white/10 border-white/20 shadow-glass': variant === 'glass',
          'bg-navy-900 border-navy-700 shadow-navy-depth': variant === 'solid',
          'bg-luxury-gradient border-gold-500/30 shadow-luxury': variant === 'gradient',
        },
        
        // Glow effect
        glow && 'shadow-gold-glow',
        
        // Hover effects
        'hover:scale-[1.02] hover:shadow-2xl',
        
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// components/ui/premium-button.tsx
interface PremiumButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
}

export function PremiumButton({ 
  variant = 'primary', 
  size = 'md', 
  glow = false,
  className,
  children,
  ...props 
}: PremiumButtonProps) {
  return (
    <Button
      className={cn(
        // Base styles
        'font-semibold transition-all duration-300 relative overflow-hidden',
        
        // Size variants
        {
          'h-8 px-3 text-xs': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
          'h-14 px-8 text-lg': size === 'xl',
        },
        
        // Variant styles
        {
          'bg-navy-600 hover:bg-navy-500 text-white shadow-navy-depth': variant === 'primary',
          'bg-slate-200 hover:bg-slate-300 text-navy-900': variant === 'secondary',
          'bg-gold-gradient hover:shadow-gold-glow text-navy-900 font-bold': variant === 'gold',
          'bg-transparent hover:bg-white/10 text-navy-100 border border-white/20': variant === 'ghost',
        },
        
        // Glow effect
        glow && 'shadow-gold-glow',
        
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
```

### Advanced Chart Components

```typescript
// components/charts/wealth-overview-chart.tsx
interface WealthOverviewChartProps {
  data: WealthData[];
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
}

export function WealthOverviewChart({ data, timeframe }: WealthOverviewChartProps) {
  return (
    <LuxuryCard variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-display-sm font-bold text-navy-900">
            Portfolio Overview
          </h3>
          <p className="text-slate-600 mt-1">
            Total wealth across all accounts
          </p>
        </div>
        
        <div className="flex gap-2">
          {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((period) => (
            <PremiumButton
              key={period}
              variant={timeframe === period ? 'gold' : 'ghost'}
              size="sm"
              onClick={() => onTimeframeChange(period)}
            >
              {period}
            </PremiumButton>
          ))}
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffbe0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ffbe0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
            />
            
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <LuxuryCard variant="solid" className="p-3">
                      <p className="text-slate-300 text-sm">
                        {format(new Date(label), 'MMMM dd, yyyy')}
                      </p>
                      <p className="text-gold-400 font-bold text-lg">
                        {formatCurrency(payload[0].value)}
                      </p>
                    </LuxuryCard>
                  );
                }
                return null;
              }}
            />
            
            <Area
              type="monotone"
              dataKey="value"
              stroke="#ffbe0b"
              strokeWidth={3}
              fill="url(#wealthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </LuxuryCard>
  );
}
```

---

## 🏦 Premium Banking Features

### Enhanced Dashboard - "Pulse Canvas"

```typescript
// app/(dashboard)/page.tsx - Premium Dashboard
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-luxury-gradient text-white">
        <div className="absolute inset-0 bg-[url('/patterns/luxury-pattern.svg')] opacity-10" />
        
        <div className="relative container mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-display-lg font-bold mb-2">
                Welcome back, {user.firstName}
              </h1>
              <p className="text-navy-200 text-lg">
                Your financial universe at a glance
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-navy-300 text-sm mb-1">Total Portfolio Value</p>
              <p className="text-display-md font-bold text-gold-400">
                {formatCurrency(totalWealth)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-success-400" />
                <span className="text-success-400 font-semibold">
                  +{portfolioGrowth}% this month
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <QuickActionCard
            icon={<Send className="w-6 h-6" />}
            title="Transfer Funds"
            description="Send money instantly"
            onClick={() => router.push('/transfers')}
            variant="gold"
          />
          <QuickActionCard
            icon={<CreditCard className="w-6 h-6" />}
            title="Pay Bills"
            description="Manage payments"
            onClick={() => router.push('/payments')}
          />
          <QuickActionCard
            icon={<Globe className="w-6 h-6" />}
            title="Wire Transfer"
            description="International transfers"
            onClick={() => router.push('/wires')}
          />
          <QuickActionCard
            icon={<MessageCircle className="w-6 h-6" />}
            title="AI Concierge"
            description="Get instant help"
            onClick={() => setShowConcierge(true)}
            glow
          />
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <section className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Accounts & Transactions */}
          <div className="lg:col-span-2 space-y-8">
            <AccountsOverview accounts={accounts} />
            <RecentTransactions transactions={recentTransactions} />
            <UpcomingPayments payments={upcomingPayments} />
          </div>
          
          {/* Right Column - Insights & Tools */}
          <div className="space-y-8">
            <WealthOverviewChart data={wealthData} timeframe={timeframe} />
            <SpendingInsights data={spendingData} />
            <MarketInsights />
            <SecurityStatus />
          </div>
        </div>
      </section>

      {/* AI Concierge Modal */}
      <AIConciergeModal 
        open={showConcierge} 
        onClose={() => setShowConcierge(false)} 
      />
    </div>
  );
}
```

### Global Transfer System

```typescript
// app/(dashboard)/transfers/page.tsx
export default function TransfersPage() {
  const [transferType, setTransferType] = useState<'internal' | 'external' | 'wire'>('internal');
  
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-display-md font-bold text-navy-900 mb-2">
          Global Transfer System
        </h1>
        <p className="text-slate-600">
          Send money anywhere in the world with enterprise-grade security
        </p>
      </div>

      {/* Transfer Type Selection */}
      <LuxuryCard variant="glass" className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TransferTypeCard
            type="internal"
            title="Internal Transfer"
            description="Between your Aurum Vault accounts"
            icon={<ArrowRightLeft className="w-8 h-8" />}
            selected={transferType === 'internal'}
            onClick={() => setTransferType('internal')}
            features={['Instant', 'No fees', 'Real-time']}
          />
          
          <TransferTypeCard
            type="external"
            title="External Transfer"
            description="To other banks and institutions"
            icon={<Building className="w-8 h-8" />}
            selected={transferType === 'external'}
            onClick={() => setTransferType('external')}
            features={['1-3 business days', 'Low fees', 'ACH/Wire']}
          />
          
          <TransferTypeCard
            type="wire"
            title="International Wire"
            description="Global transfers with SWIFT"
            icon={<Globe className="w-8 h-8" />}
            selected={transferType === 'wire'}
            onClick={() => setTransferType('wire')}
            features={['Same day', 'Competitive rates', 'SWIFT network']}
            premium
          />
        </div>
      </LuxuryCard>

      {/* Transfer Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {transferType === 'internal' && <InternalTransferForm />}
          {transferType === 'external' && <ExternalTransferForm />}
          {transferType === 'wire' && <WireTransferForm />}
        </div>
        
        <div className="space-y-6">
          <TransferLimits />
          <ExchangeRates />
          <RecentTransfers />
        </div>
      </div>
    </div>
  );
}
```

### AI Concierge Integration

```typescript
// components/ai-concierge/ai-concierge-modal.tsx
interface AIConciergeModalProps {
  open: boolean;
  onClose: () => void;
}

export function AIConciergeModal({ open, onClose }: AIConciergeModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          context: {
            userId: user.id,
            accountSummary: accounts,
            recentTransactions: recentTransactions.slice(0, 5),
          },
        }),
      });
      
      const data = await response.json();
      
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        actions: data.suggestedActions,
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Chat Interface */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-luxury-gradient text-white p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center">
                  <Bot className="w-6 h-6 text-navy-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Aurum AI Concierge</h3>
                  <p className="text-navy-200">Your personal banking assistant</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-navy-900 mb-2">
                    Welcome to Aurum AI Concierge
                  </h4>
                  <p className="text-slate-600 mb-6">
                    I'm here to help with your banking needs. Try asking me about:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <QuickPromptButton
                      text="Check my account balance"
                      onClick={() => sendMessage("What's my current account balance?")}
                    />
                    <QuickPromptButton
                      text="Recent transactions"
                      onClick={() => sendMessage("Show me my recent transactions")}
                    />
                    <QuickPromptButton
                      text="Transfer money"
                      onClick={() => sendMessage("I want to transfer money")}
                    />
                    <QuickPromptButton
                      text="Investment advice"
                      onClick={() => sendMessage("Give me investment advice")}
                    />
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {isLoading && <TypingIndicator />}
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your banking..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && input.trim()) {
                      sendMessage(input);
                      setInput('');
                    }
                  }}
                  className="flex-1"
                />
                <PremiumButton
                  variant="gold"
                  onClick={() => {
                    if (input.trim()) {
                      sendMessage(input);
                      setInput('');
                    }
                  }}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </PremiumButton>
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="w-80 border-l bg-slate-50 p-6">
            <h4 className="font-semibold text-navy-900 mb-4">Quick Actions</h4>
            
            <div className="space-y-3">
              <QuickActionButton
                icon={<CreditCard className="w-4 h-4" />}
                text="View Account Balance"
                onClick={() => sendMessage("Show me my account balances")}
              />
              <QuickActionButton
                icon={<Send className="w-4 h-4" />}
                text="Transfer Money"
                onClick={() => sendMessage("I want to make a transfer")}
              />
              <QuickActionButton
                icon={<FileText className="w-4 h-4" />}
                text="Download Statement"
                onClick={() => sendMessage("Help me download my statement")}
              />
              <QuickActionButton
                icon={<Shield className="w-4 h-4" />}
                text="Security Settings"
                onClick={() => sendMessage("Show me my security settings")}
              />
              <QuickActionButton
                icon={<HelpCircle className="w-4 h-4" />}
                text="Get Help"
                onClick={() => sendMessage("I need help with my account")}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📱 Responsive Design Implementation

### Mobile-First Approach

```typescript
// components/layout/responsive-navigation.tsx
export function ResponsiveNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center space-x-8">
        <NavigationItem href="/dashboard" icon={<Home />} label="Dashboard" />
        <NavigationItem href="/accounts" icon={<Wallet />} label="Accounts" />
        <NavigationItem href="/transfers" icon={<Send />} label="Transfers" />
        <NavigationItem href="/investments" icon={<TrendingUp />} label="Wealth" />
        <NavigationItem href="/insights" icon={<BarChart3 />} label="Insights" />
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <PremiumButton
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </PremiumButton>
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="w-80 bg-luxury-gradient text-white">
            <div className="py-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center">
                  <Vault className="w-6 h-6 text-navy-900" />
                </div>
                <span className="text-xl font-bold">Aurum Vault</span>
              </div>
              
              <nav className="space-y-2">
                <MobileNavigationItem href="/dashboard" icon={<Home />} label="Dashboard" />
                <MobileNavigationItem href="/accounts" icon={<Wallet />} label="Accounts" />
                <MobileNavigationItem href="/transfers" icon={<Send />} label="Transfers" />
                <MobileNavigationItem href="/investments" icon={<TrendingUp />} label="Wealth" />
                <MobileNavigationItem href="/insights" icon={<BarChart3 />} label="Insights" />
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

// Responsive Grid System
export function ResponsiveDashboardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {children}
    </div>
  );
}
```

---

## 🔧 Implementation Checklist

### Phase 1: Design System (Week 1)
- [ ] **Color Palette Migration**
  - [ ] Update Tailwind config with Aurum colors
  - [ ] Create CSS custom properties
  - [ ] Update existing components
  - [ ] Test color contrast ratios

- [ ] **Typography System**
  - [ ] Implement luxury font hierarchy
  - [ ] Update text components
  - [ ] Create display text variants
  - [ ] Test responsive typography

### Phase 2: Component Library (Week 2)
- [ ] **Enhanced UI Components**
  - [ ] LuxuryCard component
  - [ ] PremiumButton variants
  - [ ] Glassmorphic effects
  - [ ] Animation system

- [ ] **Chart Components**
  - [ ] WealthOverviewChart
  - [ ] SpendingInsights
  - [ ] PortfolioAllocation
  - [ ] MarketTrends

### Phase 3: Premium Features (Week 3-4)
- [ ] **Dashboard Enhancement**
  - [ ] Pulse Canvas implementation
  - [ ] Quick actions grid
  - [ ] Real-time updates
  - [ ] Personalization

- [ ] **Transfer System**
  - [ ] Multi-type transfer interface
  - [ ] Real-time validation
  - [ ] Progress tracking
  - [ ] Receipt generation

### Phase 4: AI Integration (Week 5)
- [ ] **AI Concierge**
  - [ ] Chat interface
  - [ ] Context awareness
  - [ ] Quick actions
  - [ ] Voice integration

- [ ] **Smart Features**
  - [ ] Spending insights
  - [ ] Investment recommendations
  - [ ] Fraud detection alerts
  - [ ] Predictive analytics

### Phase 5: Mobile Optimization (Week 6)
- [ ] **Responsive Design**
  - [ ] Mobile navigation
  - [ ] Touch interactions
  - [ ] Gesture support
  - [ ] Performance optimization

- [ ] **Progressive Web App**
  - [ ] Service worker
  - [ ] Offline support
  - [ ] Push notifications
  - [ ] App-like experience

---

## 🚀 Performance Optimization

### Code Splitting Strategy

```typescript
// Dynamic imports for better performance
const WealthOverviewChart = dynamic(() => import('@/components/charts/wealth-overview-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

const AIConciergeModal = dynamic(() => import('@/components/ai-concierge/ai-concierge-modal'), {
  loading: () => <ModalSkeleton />,
});

// Route-based code splitting
const TransfersPage = dynamic(() => import('@/app/(dashboard)/transfers/page'));
const InvestmentsPage = dynamic(() => import('@/app/(dashboard)/investments/page'));
```

### Image Optimization

```typescript
// components/ui/optimized-image.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className 
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    />
  );
}
```

---

*This frontend transformation guide provides the complete roadmap for upgrading NovaBank to the luxury Aurum Vault experience with premium design, advanced features, and enterprise-grade user experience.*