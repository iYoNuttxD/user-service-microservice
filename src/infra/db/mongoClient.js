import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

let connection = null;

export class MongoClient {
  constructor(uri, dbName) {
    this.uri = uri;
    this.dbName = dbName;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected && connection) {
      return connection;
    }

    try {
      logger.info('Connecting to MongoDB...', { dbName: this.dbName });
      
      await mongoose.connect(this.uri, {
        dbName: this.dbName,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      connection = mongoose.connection;
      this.isConnected = true;

      connection.on('error', (err) => {
        logger.error('MongoDB connection error', { error: err.message });
        this.isConnected = false;
      });

      connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

      logger.info('MongoDB connected successfully', { dbName: this.dbName });
      
      return connection;
    } catch (error) {
      logger.error('Failed to connect to MongoDB', { error: error.message });
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (connection) {
      await mongoose.disconnect();
      connection = null;
      this.isConnected = false;
      logger.info('MongoDB disconnected');
    }
  }

  getConnection() {
    return connection;
  }

  async healthCheck() {
    try {
      if (!this.isConnected || !connection) {
        return { status: 'disconnected' };
      }

      await connection.db.admin().ping();
      return { status: 'connected', dbName: this.dbName };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}

export function createMongoClient() {
  const uri = process.env.USERS_MONGO_URI || 'mongodb://localhost:27017';
  const dbName = process.env.USERS_MONGO_DB_NAME || 'users_db';
  
  return new MongoClient(uri, dbName);
}
