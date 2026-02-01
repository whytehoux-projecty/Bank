'use client';

interface ToggleProps {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
    disabled?: boolean;
}

export default function Toggle({
    id,
    checked,
    onChange,
    label,
    description,
    disabled = false,
}: ToggleProps) {
    return (
        <label
            htmlFor={id}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${checked
                    ? 'border-[var(--primary-color)] bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <div className="relative flex-shrink-0">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                    className="sr-only"
                />
                <div
                    className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[var(--primary-color)]' : 'bg-gray-300'
                        }`}
                >
                    <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                    />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{label}</div>
                {description && (
                    <div className="text-sm text-gray-600 mt-1">{description}</div>
                )}
            </div>
        </label>
    );
}
