import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Seed default CMS settings
    const cmsSettings = [
        // Branding
        { setting_key: 'org_logo_url', setting_value: '/assets/images/logo.png', setting_type: 'image_url', category: 'branding', description: 'Main organization logo', is_public: true },
        { setting_key: 'org_logo_light_url', setting_value: '/assets/images/logo.png', setting_type: 'image_url', category: 'branding', description: 'Logo for dark backgrounds', is_public: true },
        { setting_key: 'portal_name', setting_value: 'Global Staff Portal', setting_type: 'text', category: 'branding', description: 'Portal title displayed in header', is_public: true },
        { setting_key: 'primary_color', setting_value: '#0066CC', setting_type: 'color', category: 'branding', description: 'Primary brand color', is_public: true },
        { setting_key: 'secondary_color', setting_value: '#004C99', setting_type: 'color', category: 'branding', description: 'Secondary/dark brand color', is_public: true },

        // Login
        { setting_key: 'login_bg_url', setting_value: '/assets/images/login-bg.png', setting_type: 'image_url', category: 'login', description: 'Login page background image', is_public: true },
        { setting_key: 'login_subtitle', setting_value: 'Secure Access System', setting_type: 'text', category: 'login', description: 'Subtitle shown on login page', is_public: true },
        { setting_key: 'support_email', setting_value: 'support@organization.org', setting_type: 'text', category: 'login', description: 'IT support contact email', is_public: true },

        // Dashboard
        { setting_key: 'dashboard_welcome', setting_value: 'Welcome back, {name}', setting_type: 'text', category: 'dashboard', description: 'Dashboard welcome message template', is_public: true },

        // Footer
        { setting_key: 'copyright_text', setting_value: '© 2026 Global Organization. All rights reserved.', setting_type: 'text', category: 'footer', description: 'Footer copyright notice', is_public: true },
        { setting_key: 'privacy_policy_url', setting_value: '/privacy.html', setting_type: 'text', category: 'footer', description: 'Privacy policy page URL', is_public: true },
        { setting_key: 'terms_url', setting_value: '/terms.html', setting_type: 'text', category: 'footer', description: 'Terms of use page URL', is_public: true },
    ];

    for (const setting of cmsSettings) {
        await prisma.cmsSetting.upsert({
            where: { setting_key: setting.setting_key },
            update: {},
            create: setting,
        });
    }

    console.log(`✅ Seeded ${cmsSettings.length} CMS settings`);

    // Seed default roles
    const roles = [
        { name: 'admin', permissions: { all: true } },
        { name: 'hr_manager', permissions: { staff: ['read', 'write'], applications: ['read', 'write', 'approve'] } },
        { name: 'finance', permissions: { payroll: ['read', 'write'], finance: ['read', 'write'] } },
        { name: 'supervisor', permissions: { team: ['read'], applications: ['read', 'approve'] } },
        { name: 'staff', permissions: { profile: ['read', 'write'], applications: ['read', 'create'] } },
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role,
        });
    }

    console.log(`✅ Seeded ${roles.length} roles`);

    // Seed a default admin user (for development only)
    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash('Admin@123456', 10);

    await prisma.user.upsert({
        where: { staff_id: 'ADMIN-001' },
        update: {},
        create: {
            staff_id: 'ADMIN-001',
            email: 'admin@organization.org',
            password_hash: passwordHash,
            first_name: 'System',
            last_name: 'Administrator',
            status: 'active',
        },
    });

    // Assign admin role
    const adminUser = await prisma.user.findUnique({ where: { staff_id: 'ADMIN-001' } });
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

    if (adminUser && adminRole) {
        await prisma.userRole.upsert({
            where: { user_id_role_id: { user_id: adminUser.id, role_id: adminRole.id } },
            update: {},
            create: { user_id: adminUser.id, role_id: adminRole.id },
        });
    }

    console.log('✅ Seeded default admin user (ADMIN-001 / Admin@123456)');

    console.log('🎉 Database seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
