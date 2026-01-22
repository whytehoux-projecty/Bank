'use client';

import { useState, useEffect } from 'react';
import apiClient, { api } from '@/lib/api-client';
import { Download, FileText, Calendar, Filter } from 'lucide-react';

export default function StatementsPage() {
    const [statements, setStatements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchStatements();
    }, []);

    const fetchStatements = async () => {
        try {
            const response = await api.statements.getAll();
            // Expected response: { statements: [...] }
            setStatements(response.statements || []);
        } catch (error) {
            console.error('Failed to fetch statements', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: string, filename: string) => {
        try {
            const blob = await api.statements.download(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            // Fetch accounts to get an ID for the first account
            // In a real app, we'd pick which account to generate for
            const accountsRes = await api.accounts.getAll();
            const accounts = accountsRes.accounts || [];

            if (accounts.length > 0) {
                await apiClient.post('/api/statements/generate', {
                    accountId: accounts[0].id
                });
                // Refresh list
                await fetchStatements();
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate statement');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-charcoal-light animate-pulse">Loading statements...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-charcoal font-playfair">Account Statements</h1>
                    <p className="text-charcoal-light">View and download your monthly financial statements</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="px-4 py-2 bg-vintage-green text-white border border-vintage-green rounded-lg hover:bg-vintage-green-dark transition-all disabled:opacity-50 text-sm font-semibold"
                >
                    {generating ? 'Generating...' : 'Generate New Statement'}
                </button>
            </div>

            <div className="bg-white border border-faded-gray-light rounded-xl overflow-hidden shadow-vintage-md">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-faded-gray-light bg-parchment">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Period</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Account</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Generated On</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Type</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-charcoal">Download</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-faded-gray-light">
                            {statements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-charcoal-light">
                                        No statements available yet. Try generating one.
                                    </td>
                                </tr>
                            ) : (
                                statements.map((statement) => (
                                    <tr key={statement.id} className="hover:bg-parchment/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-vintage-green/10 rounded-lg text-vintage-green">
                                                    <FileText size={18} />
                                                </div>
                                                <span className="text-charcoal font-medium">
                                                    {new Date(statement.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-charcoal-light">
                                            <div className="flex flex-col">
                                                <span className="text-charcoal">{statement.account.accountType}</span>
                                                <span className="text-xs text-charcoal-lighter">****{statement.account.accountNumber.slice(-4)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-charcoal-light text-sm">
                                            {new Date(statement.generatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-vintage-green/10 text-vintage-green border border-vintage-green/20">
                                                {statement.statementType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDownload(statement.id, `Statement-${new Date(statement.periodStart).toISOString().slice(0, 7)}.pdf`)}
                                                className="text-charcoal-light hover:text-vintage-green transition-colors p-2 hover:bg-vintage-green/10 rounded-full"
                                                title="Download PDF"
                                                aria-label={`Download statement for ${new Date(statement.periodStart).toLocaleDateString()}`}
                                            >
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
