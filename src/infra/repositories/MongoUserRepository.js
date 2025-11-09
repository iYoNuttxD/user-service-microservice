import { IUserRepository } from '../../domain/ports/IUserRepository.js';
import { User } from '../../domain/entities/User.js';
import { UserModel } from '../db/UserModel.js';
import { NotFoundError } from '../utils/errorHandling.js';

export class MongoUserRepository extends IUserRepository {
  async save(user) {
    const userData = {
      id: user.id,
      email: user.email.value,
      passwordHash: user.passwordHash.value,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map(r => r.value),
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    const userDoc = new UserModel(userData);
    await userDoc.save();

    return this.toDomain(userDoc);
  }

  async findById(id) {
    const userDoc = await UserModel.findOne({ id });
    return userDoc ? this.toDomain(userDoc) : null;
  }

  async findByEmail(email) {
    const emailValue = typeof email === 'string' ? email : email.value;
    const userDoc = await UserModel.findOne({ email: emailValue.toLowerCase() });
    return userDoc ? this.toDomain(userDoc) : null;
  }

  async findAll({ page = 1, limit = 10, filters = {} } = {}) {
    const skip = (page - 1) * limit;
    const query = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.roles && filters.roles.length > 0) {
      query.roles = { $in: filters.roles };
    }

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query)
    ]);

    return {
      users: users.map(doc => this.toDomain(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async update(id, updates) {
    const userDoc = await UserModel.findOne({ id });
    
    if (!userDoc) {
      throw new NotFoundError('User not found');
    }

    // Update allowed fields
    if (updates.email !== undefined) {
      userDoc.email = updates.email;
    }
    if (updates.passwordHash !== undefined) {
      userDoc.passwordHash = updates.passwordHash;
    }
    if (updates.firstName !== undefined) {
      userDoc.firstName = updates.firstName;
    }
    if (updates.lastName !== undefined) {
      userDoc.lastName = updates.lastName;
    }
    if (updates.roles !== undefined) {
      userDoc.roles = updates.roles;
    }
    if (updates.isActive !== undefined) {
      userDoc.isActive = updates.isActive;
    }
    if (updates.lastLoginAt !== undefined) {
      userDoc.lastLoginAt = updates.lastLoginAt;
    }

    userDoc.updatedAt = new Date();

    await userDoc.save();

    return this.toDomain(userDoc);
  }

  async delete(id) {
    const result = await UserModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async exists(email) {
    const emailValue = typeof email === 'string' ? email : email.value;
    const count = await UserModel.countDocuments({ email: emailValue.toLowerCase() });
    return count > 0;
  }

  toDomain(doc) {
    const data = doc.toObject ? doc.toObject() : doc;
    
    return new User({
      id: data.id,
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      roles: data.roles,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLoginAt: data.lastLoginAt
    });
  }
}
