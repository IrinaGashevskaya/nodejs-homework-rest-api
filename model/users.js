const User = require('./schemas/user-schema');
const { token } = require('morgan');
const findById = async id => {
  return await User.findById({ _id: id });
};

const findByEmail = async email => {
  return await User.findOne({ email });
};
const findByVerifyTokenEmail = async token => {
  return await User.findOne({ verifyTokenEmail: token });
};

const addUser = async userOptions => {
  const user = new User(userOptions);
  return await user.save();
};

const updateToken = async (id, token) => {
  return await User.updateOne({ _id: id }, { token });
};
const updateVerifyToken = async (id, verify, verifyToken) => {
  return await User.updateOne(
    { _id: id },
    { verify, verifyTokenEmail: verifyToken },
  );
};

const updateSubscription = async subscription => {
  return await User.findOneAndUpdate({ subscription });
};

const updateAvatar = async (id, avatar = null) => {
  return await User.updateOne({ _id: id }, { avatarURL: avatar });
};

module.exports = {
  findById,
  findByEmail,
  findByVerifyTokenEmail,
  addUser,
  updateToken,
  updateVerifyToken,
  updateSubscription,
  updateAvatar,
};