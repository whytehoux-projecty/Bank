export interface LoginDTO {
    staffId: string;
    password: string;
    twoFactorToken?: string;
}

export interface RegisterDTO {
    staffId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
