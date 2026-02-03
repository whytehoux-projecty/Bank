import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

describe('Card Component', () => {
    it('should render card with content', () => {
        render(
            <Card>
                <CardContent>
                    <p>Test content</p>
                </CardContent>
            </Card>
        );

        expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
        const { container } = render(
            <Card className="custom-class">
                <CardContent>Content</CardContent>
            </Card>
        );

        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render children correctly', () => {
        render(
            <Card>
                <CardContent>
                    <h1>Title</h1>
                    <p>Description</p>
                </CardContent>
            </Card>
        );

        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
    });
});

describe('Button Component', () => {
    it('should render button with text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should handle click events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        fireEvent.click(screen.getByText('Click me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByText('Disabled')).toBeDisabled();
    });

    it('should render with icon', () => {
        const Icon = () => <span data-testid="icon">Icon</span>;
        render(<Button icon={<Icon />}>With Icon</Button>);

        expect(screen.getByTestId('icon')).toBeInTheDocument();
        expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('should apply variant styles', () => {
        const { rerender } = render(<Button variant="primary">Primary</Button>);
        expect(screen.getByText('Primary')).toHaveClass('bg-charcoal');

        rerender(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByText('Secondary')).toHaveClass('bg-vintage-gold');

        rerender(<Button variant="outline">Outline</Button>);
        expect(screen.getByText('Outline')).toHaveClass('border');
    });
});

describe('Dashboard Page', () => {
    const mockAccounts = [
        {
            id: '1',
            accountNumber: 'AV1234567890',
            accountType: 'CHECKING',
            balance: 5000,
            currency: 'USD',
        },
        {
            id: '2',
            accountNumber: 'AV0987654321',
            accountType: 'SAVINGS',
            balance: 10000,
            currency: 'USD',
        },
    ];

    const mockTransactions = [
        {
            id: '1',
            type: 'DEPOSIT',
            amount: 1000,
            description: 'Salary',
            date: '2026-01-20',
            status: 'COMPLETED',
        },
        {
            id: '2',
            type: 'WITHDRAWAL',
            amount: 500,
            description: 'ATM Withdrawal',
            date: '2026-01-19',
            status: 'COMPLETED',
        },
    ];

    beforeEach(() => {
        // Mock API calls
        global.fetch = jest.fn((url) => {
            if (url.includes('/accounts')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ accounts: mockAccounts }),
                });
            }
            if (url.includes('/transactions')) {
                return Promise.resolve({
                    json: () => Promise.resolve({ transactions: mockTransactions }),
                });
            }
            return Promise.reject(new Error('Unknown URL'));
        }) as jest.Mock;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should display account balances', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/\$5,000/)).toBeInTheDocument();
            expect(screen.getByText(/\$10,000/)).toBeInTheDocument();
        });
    });

    it('should display recent transactions', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText('Salary')).toBeInTheDocument();
            expect(screen.getByText('ATM Withdrawal')).toBeInTheDocument();
        });
    });

    it('should calculate total balance correctly', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/\$15,000/)).toBeInTheDocument(); // Total
        });
    });
});

describe('Bill Payment Component', () => {
    it('should render payee list', () => {
        const payees = [
            { id: '1', name: 'Electric Company', accountNumber: 'EC123', category: 'UTILITIES' },
            { id: '2', name: 'Internet Provider', accountNumber: 'IP456', category: 'INTERNET' },
        ];

        render(<BillPaymentPage payees={payees} />);

        expect(screen.getByText('Electric Company')).toBeInTheDocument();
        expect(screen.getByText('Internet Provider')).toBeInTheDocument();
    });

    it('should handle invoice upload', async () => {
        render(<BillPaymentPage />);

        const file = new File(['test'], 'invoice.pdf', { type: 'application/pdf' });
        const input = screen.getByLabelText(/upload invoice/i);

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText(/processing/i)).toBeInTheDocument();
        });
    });

    it('should validate payment amount', () => {
        render(<BillPaymentPage />);

        const amountInput = screen.getByLabelText(/amount/i);
        fireEvent.change(amountInput, { target: { value: '-100' } });

        const submitButton = screen.getByRole('button', { name: /pay/i });
        fireEvent.click(submitButton);

        expect(screen.getByText(/invalid amount/i)).toBeInTheDocument();
    });
});

describe('Transfer Component', () => {
    it('should validate transfer form', () => {
        render(<TransferPage />);

        const submitButton = screen.getByRole('button', { name: /transfer/i });
        fireEvent.click(submitButton);

        expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    it('should check sufficient balance', async () => {
        render(<TransferPage />);

        // Select account with $100 balance
        const fromAccount = screen.getByLabelText(/from account/i);
        fireEvent.change(fromAccount, { target: { value: 'low-balance-account' } });

        // Try to transfer $1000
        const amountInput = screen.getByLabelText(/amount/i);
        fireEvent.change(amountInput, { target: { value: '1000' } });

        const submitButton = screen.getByRole('button', { name: /transfer/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument();
        });
    });
});

// Mock components for testing
const DashboardPage = () => <div>Dashboard Mock</div>;
const BillPaymentPage = ({ payees }: any) => <div>Bill Payment Mock</div>;
const TransferPage = () => <div>Transfer Mock</div>;
