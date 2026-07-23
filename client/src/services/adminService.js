import api from '../services/api';

/**
 * Admin service utilities.
 * Currently provides a soft‑delete operation for users.
 */
export const softDeleteUser = async (userId) => {
  try {
    const res = await api.patch(`/admin/users/${userId}`, { isDeleted: true });
    return res;
  } catch (err) {
    throw err;
  }
};
export const getUsers = async (params = {}) => {
  const res = await api.get('/admin/users', { params });
  return res;
};

export const getUserDetails = async (userId) => {
  const res = await api.get(`/admin/users/${userId}`);
  return res;
};

export const getDashboardStatistics = async () => {
  const res = await api.get('/admin/users/statistics');
  return res;
};

export const changeUserStatus = async (userId, status) => {
  const res = await api.patch(`/admin/users/${userId}/status`, { status });
  return res;
};

export const changeUserRole = async (userId, role) => {
  const res = await api.patch(`/admin/users/${userId}/role`, { role });
  return res;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/admin/users/${userId}`);
  return res;
};

export const restoreUser = async (userId) => {
  const res = await api.patch(`/admin/users/${userId}/restore`);
  return res;
};

export const softDeleteUser = async (userId) => {
  return deleteUser(userId);
};

export default {
  getUsers,
  getUserDetails,
  getDashboardStatistics,
  changeUserStatus,
  changeUserRole,
  deleteUser,
  restoreUser,
  softDeleteUser,
};
