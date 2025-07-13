import { FastifyInstance } from 'fastify';
import * as authRoutes from './auth';
import * as accountRoutes from './accounts';
import * as transactionRoutes from './transactions';
import * as userRoutes from './users';
import * as kycRoutes from './kyc';
import * as wireTransferRoutes from './wire-transfers';
import * as systemRoutes from './system';
import { authenticateToken, requireKYCVerified, requireActiveAccount } from '../middleware/auth';

export default async function routes(fastify: FastifyInstance) {
  // System routes (public)
  fastify.get('/health', systemRoutes.healthCheck);
  fastify.get('/info', systemRoutes.getApiInfo);
  fastify.get('/statistics', systemRoutes.getApiStatistics);

  // Public routes (no authentication required)
  fastify.post('/auth/register', authRoutes.register);
  fastify.post('/auth/login', authRoutes.login);
  fastify.post('/auth/logout', authRoutes.logout);
  fastify.get('/auth/verify-token', authRoutes.verifyToken);

  // Protected routes (authentication required)
  fastify.register(async function (fastify) {
    // Add authentication middleware
    fastify.addHook('preHandler', authenticateToken);

    // Auth routes
    fastify.get('/auth/profile', authRoutes.getProfile);
    fastify.put('/auth/profile', authRoutes.updateProfile);
    fastify.post('/auth/change-password', authRoutes.changePassword);

    // User routes
    fastify.get('/users', userRoutes.getUsers);
    fastify.get('/users/:userId', userRoutes.getUser);
    fastify.post('/users', userRoutes.createUser);
    fastify.put('/users/:userId', userRoutes.updateUser);
    fastify.post('/users/:userId/suspend', userRoutes.suspendUser);
    fastify.post('/users/:userId/activate', userRoutes.activateUser);
    fastify.get('/users/statistics', userRoutes.getUserStatistics);

    // Account routes
    fastify.get('/accounts', accountRoutes.getAccounts);
    fastify.get('/accounts/:accountId', accountRoutes.getAccount);
    fastify.post('/accounts', accountRoutes.createAccount);
    fastify.put('/accounts/:accountId', accountRoutes.updateAccount);
    fastify.get('/accounts/:accountId/balance', accountRoutes.getAccountBalance);
    fastify.get('/accounts/:accountId/transactions', accountRoutes.getAccountTransactions);

    // Transaction routes
    fastify.get('/transactions', transactionRoutes.getTransactions);
    fastify.get('/transactions/:transactionId', transactionRoutes.getTransaction);
    fastify.post('/transactions/deposit', transactionRoutes.createDeposit);
    fastify.post('/transactions/withdrawal', transactionRoutes.createWithdrawal);
    fastify.post('/transactions/transfer', transactionRoutes.createTransfer);
    fastify.get('/transactions/statistics', transactionRoutes.getTransactionStatistics);

    // KYC routes
    fastify.get('/kyc/documents', kycRoutes.getKYCDocuments);
    fastify.post('/kyc/documents', kycRoutes.uploadKYCDocument);
    fastify.get('/kyc/documents/:documentId', kycRoutes.getKYCDocument);
    fastify.delete('/kyc/documents/:documentId', kycRoutes.deleteKYCDocument);
    fastify.get('/kyc/status', kycRoutes.getKYCStatus);

    // Wire transfer routes (require KYC verification)
    fastify.register(async function (fastify) {
      fastify.addHook('preHandler', requireKYCVerified);
      fastify.addHook('preHandler', requireActiveAccount);

      fastify.get('/wire-transfers', wireTransferRoutes.getWireTransfers);
      fastify.get('/wire-transfers/:wireTransferId', wireTransferRoutes.getWireTransfer);
      fastify.post('/wire-transfers', wireTransferRoutes.createWireTransfer);
      fastify.post('/wire-transfers/:wireTransferId/cancel', wireTransferRoutes.cancelWireTransfer);
      fastify.get('/wire-transfers/fees', wireTransferRoutes.getWireTransferFees);
    });
  });
}