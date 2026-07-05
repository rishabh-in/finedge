const { randomUUID } = require('crypto');
const AppError = require('../utils/AppError');
const store = require('../store/fileStore');
const sessionService = require('./session.service');

const createUser = async (payload) => {
  const { name, email, preferences = {} } = payload;

  if (!name || !email) {
    throw new AppError('User name and email are required.', 400);
  }

  const users = await store.findAll('users');
  const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    throw new AppError('A user with this email already exists.', 409);
  }

  const user = {
    id: randomUUID(),
    name,
    email,
    preferences,
    createdAt: new Date().toISOString(),
  };

  await store.insert('users', user);

  return {
    user,
    token: sessionService.createToken(user),
  };
};

const getUserById = async (id) => {
  const user = await store.findById('users', id);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};

module.exports = {
  createUser,
  getUserById,
};
