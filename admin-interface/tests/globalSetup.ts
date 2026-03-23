import { execSync } from "child_process";

export default async function globalSetup() {
  console.log("Setting up test environment...");

  // Set test environment
  process.env['NODE_ENV'] = "test";
  process.env.DATABASE_URL =
    process.env['TEST_DATABASE_URL'] ||
    "postgresql://postgres:password@localhost:5432/aurumvault_test";

  try {
    // Use db push for tests to avoid migration dependency
    // Run migrations
    console.log("Pushing database schema...");
    execSync("npx prisma db push --skip-generate", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });

    // Generate Prisma client
    console.log("Generating Prisma client...");
    execSync("npx prisma generate", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });

    console.log("Test environment setup complete.");
  } catch (error) {
    console.error("Failed to setup test environment:", error);
    process.exit(1);
  }
}
