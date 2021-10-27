const User = require('../model/users');
const { HttpCode } = require('../helper/constants');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const signup = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findByEmail(email);
  if (user) {
    return res.status(HttpCode.CONFLICT).json({
      status: '409 Conflict',
      code: HttpCode.CONFLICT,
      message: 'Email in use',
    });
  }
  try {
    const newUser = await User.addUser(req.body);
    return res.status(HttpCode.CREATED).json({
      status: '201 Created',
      code: HttpCode.CREATED,
      data: {
        id: newUser.id,
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  const isValidPassword = await user?.validPassword(password);
  if (!user || !isValidPassword) {
    return res.status(HttpCode.UNAUTHORIZED).json({
      status: '401 Unauthorized',
      code: HttpCode.CONFLICT,
      message: 'Email or password is wrong',
    });
  }
  const payload = { id: user.id };
  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '2h' });
  await User.updateToken(user.id, token);
  return res.status(HttpCode.OK).json({
    status: '200 OK',
    code: HttpCode.OK,
    data: {
      token,
      id: user.id,
    },
  });
};

const logout = async (req, res, next) => {
  const id = req.user.id;
  try {
    await User.updateToken(id, null);
    return res.status(HttpCode.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (user) {
      return res.status(HttpCode.OK).json({
        status: '200 OK',
        code: HttpCode.OK,
        data: {
          email: user.email,
          subscription: user.subscription,
        },
      });
    } else {
      return res.status(HttpCode.NOT_FOUND).json({
        status: 'error',
        code: HttpCode.NOT_FOUND,
        message: `Not found any contact with id: ${id}`,
        data: 'Not Found',
      });
    }
  } catch (error) {
    next(error);
  }
};

const updateSubscriptionUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { subscription, email } = req.body;
    const user = await User.updateSubscription(subscription);
    console.log(user);
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: { subscription, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrent,
  updateSubscriptionUser,
};