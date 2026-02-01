'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/lib/api';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import StaffHeader from '@/components/layout/StaffHeader';

interface EmploymentHistory {
    id: string;
    positionTitle: string;
    department: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
}

interface Document {
    id: string;
    type: string;
    name: string;
    uploadDate: string;
    url: string;
}

export default function MyContractPage() {
    return (
        <ProtectedRoute>
            <MyContractContent />
        </ProtectedRoute>
    );
}

function MyContractContent() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [employmentHistory, setEmploymentHistory] = useState<EmploymentHistory[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load employment history
            const historyRes = await API.request('/staff/employment', { auth: true });
            if (historyRes?.data) {
                // Map snake_case to camelCase
                setEmploymentHistory(historyRes.data.map((item: any) => ({
                    id: item.id,
                    positionTitle: item.position_title,
                    department: item.department,
                    startDate: item.start_date,
                    endDate: item.end_date,
                    isCurrent: !item.end_date
                })));
            }

            // Load documents
            const docsRes = await API.request('/staff/documents', { auth: true });
            if (docsRes?.data) {
                // Map snake_case to camelCase
                setDocuments(docsRes.data.map((doc: any) => ({
                    id: doc.id,
                    type: doc.document_type,
                    name: doc.document_name,
                    uploadDate: doc.uploaded_at,
                    url: doc.file_url
                })));
            }
        } catch (error) {
            console.error('Error loading contract data:', error);
            // setEmploymentHistory([]); // Ensure empty on error or handle gracefully
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Present';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleRequestDocument = () => {
        alert('Document request feature coming soon!');
    };

    const getDocumentIcon = (type: string) => {
        const icons: Record<string, string> = {
            employment: '📄',
            offer: '📋',
            nda: '🔒',
            contract: '📝',
            certificate: '🎓',
        };
        return icons[type] || '📁';
    };

    const displayHistory = employmentHistory;
    const displayDocuments = documents;

    const skills = ['Leadership', 'Project Management', 'Communication', 'Problem Solving', 'Team Work'];

    return (
        <div className="min-h-screen bg-gray-50">
            <StaffHeader />

            {/* Page Header */}
            <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] text-white">
                <div className="container-custom py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">📋 My Contract</h1>
                            <p className="text-blue-100 mt-2">Employment profile, contract, and documents</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handlePrint} className="btn bg-white text-[#1a365d] hover:bg-gray-100">
                                🖨️ Print Record
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Summary */}
                        <div className="card">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                    {user?.firstName?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-gray-900 truncate">
                                        {user?.firstName} {user?.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-600">{user?.position || 'Staff Member'}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                    <span>🏢</span>
                                    {user?.department || 'General'}
                                </span>
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                    <span>✓</span>
                                    Active
                                </span>
                            </div>
                        </div>

                        {/* Personal Info */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Personal Info</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Staff ID</span>
                                    <span className="font-semibold text-gray-900">{user?.staffId || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Date Joined</span>
                                    <span className="font-semibold text-gray-900">
                                        {formatDate(user?.joinedAt || '2024-01-15')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Gender</span>
                                    <span className="font-semibold text-gray-900">{user?.gender || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Nationality</span>
                                    <span className="font-semibold text-gray-900">{user?.nationality || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">📞 Contact Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm">
                                        📧
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-gray-500 uppercase">Email</div>
                                        <div className="text-sm font-medium text-gray-900 truncate">{user?.email}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm">
                                        📱
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-gray-500 uppercase">Phone</div>
                                        <div className="text-sm font-medium text-gray-900">{user?.phone || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm">
                                        🏠
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-gray-500 uppercase">Address</div>
                                        <div className="text-sm font-medium text-gray-900">{user?.address || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Skills & Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Employment History */}
                        <div className="card">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Employment History</h3>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[var(--primary-color)]"></div>
                                    <p className="text-gray-600 mt-4">Loading...</p>
                                </div>
                            ) : displayHistory.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No employment history available</p>
                                </div>
                            ) : (
                                <div className="relative pl-8">
                                    {/* Timeline line */}
                                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                                    {/* Timeline items */}
                                    <div className="space-y-6">
                                        {displayHistory.map((item) => (
                                            <div key={item.id} className="relative">
                                                {/* Timeline dot */}
                                                <div
                                                    className={`absolute -left-[26px] top-1 w-3 h-3 rounded-full border-3 ${item.isCurrent
                                                        ? 'bg-green-500 border-green-500'
                                                        : 'bg-[#1a365d] border-[#1a365d]'
                                                        } ring-4 ring-white`}
                                                ></div>

                                                {/* Content */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{item.positionTitle}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{item.department}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(item.startDate)} - {formatDate(item.endDate)}
                                                        </span>
                                                        {item.isCurrent && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Employment Documents */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">📄 Employment Documents</h3>
                                <button onClick={handleRequestDocument} className="btn btn-secondary btn-sm">
                                    Request Document
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[var(--primary-color)]"></div>
                                    <p className="text-gray-600 mt-4">Loading...</p>
                                </div>
                            ) : displayDocuments.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No documents available</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {displayDocuments.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm">
                                                {getDocumentIcon(doc.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm text-gray-900 truncate">{doc.name}</h4>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} • {formatDate(doc.uploadDate)}
                                                </p>
                                            </div>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 bg-[#1a365d] text-white rounded-lg text-xs font-medium hover:bg-[#0f2744] transition-colors"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Current Contract */}
                        <div className="card">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">📋 Current Contract</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">
                                        📄
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase">Contract Type</div>
                                        <div className="text-sm font-semibold text-gray-900 mt-1">Permanent</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">
                                        📅
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase">Start Date</div>
                                        <div className="text-sm font-semibold text-gray-900 mt-1">
                                            {formatDate(user?.joinedAt || '2024-01-15')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">
                                        ⏰
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase">End Date</div>
                                        <div className="text-sm font-semibold text-gray-900 mt-1">Ongoing</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
