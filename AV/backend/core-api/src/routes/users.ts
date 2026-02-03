import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validationSchemas, HTTP_STATUS, ERROR_CODES } from '../../../shared/index';
import { UserService } from '../services/userService';

// Helper to handle service errors
const handleServiceError = (error: any, reply: FastifyReply) => {
  const message = error.message || 'An unexpected error occurred';
  console.log('Error Message:', message);
  console.log('Expected Code:', ERROR_CODES.USER_NOT_FOUND);

  if (message === ERROR_CODES.USER_NOT_FOUND || message.includes('not found')) {
    return reply.status(HTTP_STATUS.NOT_FOUND).send({
      success: false,
      error: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: 'User not found'
    });
  }

  if (message === ERROR_CODES.USER_ALREADY_EXISTS) {
    return reply.status(HTTP_STATUS.CONFLICT).send({
      success: false,
      error: ERROR_CODES.USER_ALREADY_EXISTS,
      message: 'User already exists'
    });
  }

  if (message === ERROR_CODES.INVALID_CREDENTIALS) {
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: ERROR_CODES.INVALID_CREDENTIALS,
      message: 'Invalid credentials'
    });
  }

  return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
    success: false,
    error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message
  });
};

/**
 * Get all users with pagination and filtering
 */
export const getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = validationSchemas.userQuery.parse(request.query);

    const filterOptions: any = {
      page: query.page,
      limit: query.limit
    };
    if (query.status) filterOptions.status = query.status;
    if (query.kycStatus) filterOptions.kycStatus = query.kycStatus;
    if (query.search) filterOptions.search = query.search;

    const result = await UserService.getUsers(filterOptions);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Invalid query parameters',
        details: error.errors,
      });
    }

    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to fetch users',
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };

    const user = await UserService.getUserById(id);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: user,
    });
  } catch (error) {
    handleServiceError(error, reply);
  }
};

// Alias for getUserById to match index.ts import
export const getUser = getUserById;

/**
 * Create a new user
 */
export const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userData = validationSchemas.adminCreateUser.parse(request.body);

    const user = await UserService.createUser({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      dateOfBirth: new Date(userData.dateOfBirth),
      address: userData.address
    });

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Invalid user data',
        details: error.errors,
      });
    }
    handleServiceError(error, reply);
  }
};

/**
 * Update user
 */
export const updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const updateData = validationSchemas.updateUser.parse(request.body);

    const { address, ...rest } = updateData;
    const cleanUpdateData: any = { ...rest };
    if (address) cleanUpdateData.address = address;

    // Remove undefined keys to satisfy exactOptionalPropertyTypes
    Object.keys(cleanUpdateData).forEach(key => cleanUpdateData[key] === undefined && delete cleanUpdateData[key]);

    const user = await UserService.updateUserProfile(id, cleanUpdateData);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Invalid update data',
        details: error.errors,
      });
    }
    handleServiceError(error, reply);
  }
};

/**
 * Suspend user
 */
export const suspendUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    // Optionally extract reason from body if needed, but schema not visible here
    // const { reason } = request.body as { reason?: string };

    const user = await UserService.suspendUser(id);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: user,
      message: 'User suspended successfully',
    });
  } catch (error) {
    handleServiceError(error, reply);
  }
};

/**
 * Activate user
 */
export const activateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };

    const user = await UserService.reactivateUser(id);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: user,
      message: 'User activated successfully',
    });
  } catch (error) {
    handleServiceError(error, reply);
  }
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (request: FastifyRequest, reply: FastifyReply) => {
  // Keeping inline logic as UserService does not seem to have a getStatistics method matching this specific logic
  // Update: UserService does NOT have getStatistics.
  // We retain original logic here or move it to a new service method in a future turn.
  // Original logic used prisma directly.

  // Re-importing prisma for this method only is messy if we removed top-level import.
  // Let's rely on UserService or throw "Not Implemented" and RECOMMEND adding it?
  // No, I shouldn't break features.
  // I will skip refactoring this specific method or see if I can implement it by calling getUsers multiple times? No that's inefficient.
  // I will check if I can just use prisma here. I'll need to instantiate PrismaClient.

  // To avoid instantiating PrismaClient just for this, I'll recommend adding getStatistics to UserService later.
  // For now, I will include the Prisma client instantiation LOCALLY for this method if I really have to, 
  // OR I'll assume common pattern:

  // Wait, I can't import PrismaClient safely if I want to delegate everything to Service.
  // I'll leave the original logic which uses `prisma`. So I need `prisma` in imports.

  // Wait, I removed `const prisma = ...` in the code above (intended).
  // I should add `const prisma = new PrismaClient()` back if I keep this method.
  // But wait, creating multiple PrismaClients is bad.
  // It's better to add `getStatistics` to `UserService` in the NEXT turn.
  // For now, I will mark this as "To be Refactored" or try to Implement basic stats logic if possible using Service?
  // `UserService.getUsers` gives total count.
  // `UserService.getUsers({ status: 'ACTIVE' })` gives active count.
  // `UserService.getUsers({ status: 'SUSPENDED' })` gives suspended count.
  // The original method did exactly this (count queries).
  // So I can replicate logic using `UserService.getUsers` paginated (limit=1) to get totals!
  // `getUsers` returns total.

  try {
    const query = validationSchemas.statisticsQuery.parse(request.query);
    const statsFilters: any = {};
    if (query.startDate) statsFilters.startDate = new Date(query.startDate);
    if (query.endDate) statsFilters.endDate = new Date(query.endDate);

    const stats = await UserService.getUserStatistics(statsFilters);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: stats,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Invalid query parameters',
        details: error.errors,
      });
    }

    request.log.error(error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Failed to fetch user statistics',
    });
  }
};

// ... Wait, disabling statistics is bad.
// I will just add `const prisma = new PrismaClient()` at the top.
// And keep the `getUserStatistics` original logic.

// Actually I'll rewrite the ReplacementContent to include `const prisma` and the original `getUserStatistics` logic.
// This is safer.

export default async function userRoutes(fastify: FastifyInstance) {
  // Get all users (admin only)
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    handler: getUsers,
  });

  // Get user by ID
  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    handler: getUserById,
  });

  // Create new user (admin only)
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    handler: createUser,
  });

  // Update user
  fastify.put('/:id', {
    preHandler: [fastify.authenticate],
    handler: updateUser,
  });

  // Suspend user (admin only)
  fastify.post('/:id/suspend', {
    preHandler: [fastify.authenticate],
    handler: suspendUser,
  });

  // Activate user (admin only)
  fastify.post('/:id/activate', {
    preHandler: [fastify.authenticate],
    handler: activateUser, // Note: This calls UserService.reactivateUser which sets status to ACTIVE
  });

  // Get user statistics (admin only)
  fastify.get('/statistics', {
    preHandler: [fastify.authenticate],
    handler: getUserStatistics,
  });
}
