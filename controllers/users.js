const jwt = require('jsonwebtoken');
const jimp = require('jimp');
const fs = require('fs/promises');
const path = require('path');
const { nanoid } = require('nanoid');
//const { promisify } = require('util');
require('dotenv').config();
const User = require('../model/users');
const { HttpCode } = require('../helper/constants');
const EmailService = require('../services/email');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;


const signup = async (req, res, next) => {
  const { email, password, name } = req.body;

  const user = await User.findByEmail(email);
  if (user) {
    return res.status(HttpCode.CONFLICT).json({
      status: '409 Conflict',
      code: HttpCode.CONFLICT,
      message: 'Email in use',
    });
  }
  try {
    const verifyToken = nanoid();
    const newUser = { email, password, verifyToken };
    console.log(newUser);
      const user = await User.addUser(newUser);
    try {
      const mailService = new EmailService(process.env.NODE_ENV);
      await mailService.sendVerifyEmail(verifyToken, email, name);
    } catch (e) {
      console.log(e.message);
    }
    
    
    return res.status(HttpCode.CREATED).json({
      status: '201 Created',
      code: HttpCode.CREATED,
      data: {
        id: user.id,
        email: user.email,
        subscription: user.subscription,
        avatar: user.avatar,
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
      email: user.email,
      subscription: user.subscription,
      avatarUrl: user.avatar,
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
    const { subscription, id } = req.body;

    const user = await User.updateSubscription(subscription, id);

    if (user) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: {
          user: {
            email: user.email,
            subscription: user.subscription,
          },
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

const saveAvatarToStatic = async req => {
  const id = req.user.id;

  const TMP_DIR = process.env.TMP_DIR;
  const AVATARS_OF_USERS =  process.env.AVATARS_OF_USERS;
  const pathFile = req.file.path;
  const newNameAvatar = `${Date.now()}-${req.file.originalname}`;
  const img = await jimp.read(pathFile);
  await img
    .autocrop()
    .cover(250, 250, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)
    .writeAsync(path.join(AVATARS_OF_USERS, newNameAvatar));
  const avatarUrl = path.normalize(path.join(process.env.AVATARS, newNameAvatar));
  try {
    await fs.unlink(pathFile);
        
    await fs.unlink(path.join(process.cwd(),process.env.PUBLIC_FOLDER, req.user.avatarURL));
  } catch (error) {
    console.log(error.message);
  }
  return avatarUrl;
};

const updateAvatar = async (req, res, next) => {
  try {
    const id = req.user.id;
    const avatarUrl = await saveAvatarToStatic(req);
    
    await User.updateAvatar(id, avatarUrl);
    return res.json({
      status: 'Success',
      code: HttpCode.OK,
      data: {
        avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
const verify = async (req, res, next) => {
  try {
    const user = await User.findByVarifyTokenEmail(
      req.params.verificationToken,
    );
    if (user) {
      await User.updateVarifyToken(user.id, true, null);
      return res.status(HttpCode.OK).json({
        status: '200 OK',
        code: HttpCode.OK,
        data: { message: 'Verification successful' },
      });
    }
    return res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      data: { message: 'User not found ' },
    });
  } catch (e) {
    next(e);
  }
};

const repeatEmailVerify = async (req, res, next) => {
  try {
    const user = await User.findByEmail(req.body.email);
    if (user) {
      const { name, verifyTokenEmail, email } = user;
      const emailService = new EmailService(process.env.NODE_ENV);
      await emailService.sendVerifyEmail(verifyTokenEmail, email, name);
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: { message: 'Verification email sent' },
      });
    }
    return res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: HttpCode.BAD_REQUEST,
      message: 'Verification has already been passed',
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
  updateAvatar,
    verify,
  repeatEmailVerify,
};