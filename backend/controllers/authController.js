const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { publicUser } = require('../utils/helpers');
const { clearUserData } = require('../utils/clearUserData');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendAuth = (res, status, user) => {
  const token = generateToken(user._id);
  const payload = publicUser(user);
  res.status(status).json({
    success: true,
    token,
    user: payload,
    data: { token, user: payload },
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('A user with this email already exists', 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  sendAuth(res, 201, user);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  sendAuth(res, 200, user);
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: publicUser(req.user) });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, password, currentPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user) throw new AppError('User not found', 404);

  if (password) {
    const matches = await user.matchPassword(currentPassword);
    if (!matches) throw new AppError('Current password is incorrect', 400);
    user.passwordHash = await bcrypt.hash(password, 10);
  }
  if (name) user.name = name;
  await user.save();

  res.status(200).json({ success: true, data: publicUser(user) });
});

const deleteMyData = asyncHandler(async (req, res) => {
  const removed = await clearUserData(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Your CRM records were deleted',
    data: removed,
  });
});

module.exports = { register, login, getMe, updateMe, deleteMyData };
