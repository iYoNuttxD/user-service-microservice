export class UserProfile {
  constructor({ userId, firstName, lastName, email, roles, isActive, lastLoginAt }) {
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.roles = roles;
    this.isActive = isActive;
    this.lastLoginAt = lastLoginAt;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  toJSON() {
    return {
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      roles: this.roles,
      isActive: this.isActive,
      lastLoginAt: this.lastLoginAt,
      fullName: this.fullName
    };
  }
}
