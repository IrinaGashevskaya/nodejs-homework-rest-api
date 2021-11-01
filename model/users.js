const User = require('./schemas/user-schema');

const findById = async id => {
  return await User.findById({ _id: id });
};

const findByEmail = async email => {
  return await User.findOne({ email });
};

const addUser = async userOptions => {
  const user = new User(userOptions);
  return await user.save();
};

const updateToken = async (id, token) => {
  return await User.updateOne({ _id: id }, { token });
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
  addUser,
  updateToken,
  updateSubscription,
  updateAvatar,
};