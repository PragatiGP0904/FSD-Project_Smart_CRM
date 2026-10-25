const mongoose = require('mongoose');
const AppError = require('./AppError');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === String(value);
}

function assertObjectId(value, label = 'Record') {
  if (!isObjectId(value)) {
    throw new AppError(`${label} not found`, 404);
  }
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function cleanString(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function pagination(query, fallbackLimit = 10) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || fallbackLimit;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function sortFrom(value, fallback = '-createdAt') {
  const field = value || fallback;
  const direction = field.startsWith('-') ? -1 : 1;
  const key = field.replace(/^-/, '');
  return { [key]: direction };
}

function startOfIsoWeek(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  return copy;
}

module.exports = {
  escapeRegex,
  isObjectId,
  assertObjectId,
  publicUser,
  cleanString,
  pagination,
  sortFrom,
  startOfIsoWeek,
};
