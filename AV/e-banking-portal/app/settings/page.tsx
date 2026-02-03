'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import {
    User,
    Lock,
    Bell,
    Globe,
    Shield,
    Mail,
    Phone,
    Eye,
    EyeOff,
    CheckCircle,
    Save,
    Moon,
    Sun,
    Smartphone,
    CreditCard
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VintageIcon } from '@/components/ui/vintage-icon';

export default function SettingsPage() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [profileData, setProfileData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
    });

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: true,
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false,
        transactionAlerts: true,
        loginAlerts: true,
        marketingEmails: false,
    });

    const [preferences, setPreferences] = useState({
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York',
        theme: 'light',
    });

    const handleSave = (section: string) => {
        // Simulate API call
        alert(`${section} settings updated successfully.`);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-4 animate-fade-in-up">

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-playfair font-bold text-charcoal">Settings</h1>
                <p className="text-muted-foreground">Manage your personal information, security, and app preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="w-full flex h-auto p-1 bg-muted/50 rounded-xl overflow-x-auto justify-start md:justify-center">
                    <TabsTrigger value="profile" className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg gap-2">
                        <User className="w-4 h-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg gap-2">
                        <Lock className="w-4 h-4" /> Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg gap-2">
                        <Bell className="w-4 h-4" /> Notifications
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg gap-2">
                        <Globe className="w-4 h-4" /> Preferences
                    </TabsTrigger>
                </TabsList>

                {/* Profile Content */}
                <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your contact details and address.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                        value={profileData.firstName}
                                        onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={profileData.lastName}
                                        onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9"
                                            value={profileData.email}
                                            onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9"
                                            value={profileData.phone}
                                            onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input
                                    value={profileData.address}
                                    onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input
                                        value={profileData.city}
                                        onChange={e => setProfileData({ ...profileData, city: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input
                                        value={profileData.state}
                                        onChange={e => setProfileData({ ...profileData, state: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Zip Code</Label>
                                    <Input
                                        value={profileData.zipCode}
                                        onChange={e => setProfileData({ ...profileData, zipCode: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 flex justify-end">
                            <Button onClick={() => handleSave('Profile')} icon={<Save className="w-4 h-4" />}>
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Security Content */}
                <TabsContent value="security" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={securityData.currentPassword}
                                        onChange={e => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                    />
                                    <button
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? "text" : "password"}
                                        value={securityData.newPassword}
                                        onChange={e => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                    />
                                    <button
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm New Password</Label>
                                <Input
                                    type="password"
                                    value={securityData.confirmPassword}
                                    onChange={e => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 flex justify-end">
                            <Button onClick={() => handleSave('Password')}>Update Password</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <VintageIcon icon={Shield} variant="green" size="sm" />
                                <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Enable 2FA</Label>
                                <p className="text-sm text-muted-foreground max-w-[300px]">
                                    Secure your account with an additional confirmation step via SMS or Authenticator App.
                                </p>
                            </div>
                            <Switch
                                checked={securityData.twoFactorEnabled}
                                onCheckedChange={(checked) => setSecurityData({ ...securityData, twoFactorEnabled: checked })}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Content */}
                <TabsContent value="notifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Choose when and how you want to be notified.</CardDescription>
                        </CardHeader>
                        <CardContent className="divide-y divide-border">
                            {[
                                { key: 'emailNotifications', icon: Mail, label: 'Email Notifications', desc: 'Receive updates via email' },
                                { key: 'smsNotifications', icon: Smartphone, label: 'SMS Notifications', desc: 'Receive updates via text message' },
                                { key: 'transactionAlerts', icon: CreditCard, label: 'Transaction Alerts', desc: 'Get notified for every transaction' },
                                { key: 'pushNotifications', icon: Bell, label: 'Push Notifications', desc: 'Receive push notifications' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                            <item.icon size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                        onCheckedChange={c => setNotificationSettings({ ...notificationSettings, [item.key]: c })}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preferences Content */}
                <TabsContent value="preferences" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>App Preferences</CardTitle>
                            <CardDescription>Customize your regional and visual settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Language</Label>
                                    <Select value={preferences.language} onValueChange={v => setPreferences({ ...preferences, language: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Español</SelectItem>
                                            <SelectItem value="fr">Français</SelectItem>
                                            <SelectItem value="de">Deutsch</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Select value={preferences.currency} onValueChange={v => setPreferences({ ...preferences, currency: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                            <SelectItem value="JPY">JPY (¥)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Timezone</Label>
                                    <Select value={preferences.timezone} onValueChange={v => setPreferences({ ...preferences, timezone: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Theme</Label>
                                    <Select value={preferences.theme} onValueChange={v => setPreferences({ ...preferences, theme: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Theme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">
                                                <div className="flex items-center gap-2"><Sun size={14} /> Light</div>
                                            </SelectItem>
                                            <SelectItem value="dark">
                                                <div className="flex items-center gap-2"><Moon size={14} /> Dark</div>
                                            </SelectItem>
                                            <SelectItem value="system">
                                                <div className="flex items-center gap-2"><Smartphone size={14} /> System</div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 flex justify-end">
                            <Button onClick={() => handleSave('Preferences')}>Save Preferences</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
