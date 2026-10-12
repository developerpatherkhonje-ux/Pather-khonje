const mongoose = require('mongoose');

const headOfficeRoles = new Set(['admin', 'super_admin']);

const isHeadOfficeUser = (user) =>
  Boolean(user && (headOfficeRoles.has(user.role) || user.permissions?.includes('all_branches')));

const getUserBranchId = (user) => {
  if (!user?.branch) return null;
  return String(user.branch._id || user.branch);
};

const canAccessBranch = (user, branchId) => {
  if (isHeadOfficeUser(user)) return true;
  const userBranch = getUserBranchId(user);
  return Boolean(userBranch && branchId && String(branchId) === userBranch);
};

const applyBranchScope = (filter = {}, user, requestedBranchId) => {
  const next = { ...filter };
  if (isHeadOfficeUser(user)) {
    if (requestedBranchId && requestedBranchId !== 'all') {
      next.branch = requestedBranchId;
    }
    return next;
  }

  const branchId = getUserBranchId(user);
  next.branch = branchId && mongoose.Types.ObjectId.isValid(branchId)
    ? new mongoose.Types.ObjectId(branchId)
    : branchId || null;
  return next;
};

module.exports = {
  isHeadOfficeUser,
  getUserBranchId,
  canAccessBranch,
  applyBranchScope,
};
