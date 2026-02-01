export interface CMSSetting {
    id: number;
    setting_key: string;
    setting_value: string;
    setting_type: string;
    category: string;
    description: string | null;
    is_public: boolean;
    updated_by: string | null;
    updated_at: Date;
    created_at: Date;
    updatedByUser?: {
        first_name: string;
        last_name: string;
    } | null;
}

export interface UpdateSettingDTO {
    key: string;
    value: string;
}
