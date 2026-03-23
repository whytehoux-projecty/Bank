/**
 * Prisma singleton – import this instead of calling `new PrismaClient()`.
 * Re-exports the shared instance managed by DatabaseManager so that all
 * route handlers, services, and middleware share one connection pool.
 */
import db from './database';

const prisma = db.prisma;
export default prisma;
