import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export async function ensureIndexes() {
  try {
    const db = mongoose.connection.db;
    
    // Users collection indexes
    const usersCollection = db.collection('users');
    
    // Unique index on email
    await usersCollection.createIndex(
      { email: 1 },
      { unique: true, name: 'idx_users_email_unique' }
    );
    
    // Index on createdAt for sorting
    await usersCollection.createIndex(
      { createdAt: 1 },
      { name: 'idx_users_createdAt' }
    );
    
    // Index on roles for filtering
    await usersCollection.createIndex(
      { roles: 1 },
      { name: 'idx_users_roles' }
    );
    
    // Index on isActive for filtering
    await usersCollection.createIndex(
      { isActive: 1 },
      { name: 'idx_users_isActive' }
    );

    logger.info('MongoDB indexes ensured successfully');
  } catch (error) {
    logger.error('Failed to ensure MongoDB indexes', { error: error.message });
    throw error;
  }
}
