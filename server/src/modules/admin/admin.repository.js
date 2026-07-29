const User = require('../user/user.model');

class AdminRepository {
  /**
   * Find all users with filters, search, pagination, and sorting.
   * @param {object} filters - MongoDB query filters.
   * @param {object} options - Pagination and sorting options.
   * @returns {Promise<object>} { users, total }
   */
  async findAllUsers(filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(filters)
        .select('-password -__v -resetToken -deviceTokens -lastLoginIp -loginHistory')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filters),
    ]);

    return { users, total };
  }

  /**
   * Find user by ID (includes soft-deleted users for admin view).
   * @param {string} id - User ID.
   * @returns {Promise<User|null>} The user document.
   */
  async findUserById(id) {
    return User.findById(id).select('-password -__v -resetToken');
  }

  /**
   * Update user status.
   * @param {string} id - User ID.
   * @param {string} status - New status.
   * @returns {Promise<User|null>} Updated user.
   */
  async updateUserStatus(id, status) {
    return User.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  }

  /**
   * Update user role.
   * @param {string} id - User ID.
   * @param {string} role - New role.
   * @returns {Promise<User|null>} Updated user.
   */
  async updateUserRole(id, role) {
    return User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
  }

  /**
   * Soft delete a user.
   * @param {string} id - User ID.
   * @param {string} deletedById - Admin user ID performing the deletion.
   * @returns {Promise<User|null>} Updated user.
   */
  async softDeleteUser(id, deletedById) {
    return User.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedById,
        status: 'inactive',
      },
      { new: true }
    );
  }

  /**
   * Restore a soft-deleted user.
   * @param {string} id - User ID.
   * @returns {Promise<User|null>} Updated user.
   */
  async restoreUser(id) {
    return User.findByIdAndUpdate(
      id,
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        status: 'active',
      },
      { new: true }
    );
  }

  /**
   * Count users by role.
   * @param {string} role - Role name.
   * @returns {Promise<number>} Count.
   */
  async countByRole(role) {
    return User.countDocuments({ role: { $regex: new RegExp(`^${role}$`, 'i') }, isDeleted: false });
  }

  /**
   * Count users by status.
   * @param {string} status - Status value.
   * @returns {Promise<number>} Count.
   */
  async countByStatus(status) {
    return User.countDocuments({ status: { $regex: new RegExp(`^${status}$`, 'i') }, isDeleted: false });
  }

  /**
   * Count users registered this month.
   * @returns {Promise<number>} Count.
   */
  async countNewThisMonth() {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return User.countDocuments({ createdAt: { $gte: start }, isDeleted: false });
  }

  /**
   * Count all admins (for last-admin protection).
   * @returns {Promise<number>} Admin count.
   */
  async countAdmins() {
    return User.countDocuments({ role: 'admin', isDeleted: false });
  }

  /**
   * Aggregate dashboard statistics.
   * @returns {Promise<object>} Statistics object.
   */
  async getUserStatistics() {
    const users = await User.find({}).select('role status createdAt isDeleted').lean();

    const stats = {
      totalUsers: 0,
      totalVolunteers: 0,
      totalAdmins: 0,
      totalCoordinators: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      suspendedUsers: 0,
      deletedUsers: 0,
      newThisMonth: 0,
    };

    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    for (const user of users) {
      if (user.isDeleted) {
        stats.deletedUsers++;
        continue;
      }
      stats.totalUsers++;

      const role = String(user.role || '').toLowerCase();
      if (role === 'volunteer') stats.totalVolunteers++;
      else if (role === 'admin') stats.totalAdmins++;
      else if (role === 'coordinator') stats.totalCoordinators++;

      const status = String(user.status || '').toLowerCase();
      if (status === 'active') stats.activeUsers++;
      else if (status === 'inactive') stats.inactiveUsers++;
      else if (status === 'suspended') stats.suspendedUsers++;

      if (user.createdAt && new Date(user.createdAt) >= start) {
        stats.newThisMonth++;
      }
    }

    return stats;
  }
}

module.exports = new AdminRepository();
