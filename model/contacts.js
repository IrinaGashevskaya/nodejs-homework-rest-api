const Contacts = require('./schemas/contacts-schema');

const listContacts = async (userId, query) => {
  const {
    sortBy,
    sortByDesc,
    filter,
    favorite = null,
    limit = 10,
    page = 1,
    offset = 0,
  } = query;
  const optionsSearch = { owner: userId };
  if (favorite !== null) {
    optionsSearch.favorite = favorite;
  }
  const results = await Contacts.paginate(optionsSearch, {
    limit,
    page,
    offset,
    sort: {
      ...(sortBy ? { [`${sortBy}`]: 1 } : {}),
      ...(sortByDesc ? { [`${sortByDesc}`]: -1 } : {}),
    },
    select: filter ? filter.split('|').join(' ') : '',
    populate: { path: 'owner', select: 'email subscription -_id' },
  });
  return results;
};

const getById = async (userId, id, email) => {
  const result = await Contacts.findById(id, email, { owner: userId }).populate(
    {
      path: 'owner',
      select: 'email subscription -_id',
    },
  );
  return result;
};

const removeContact = async (userId, id) => {
  const result = await Contacts.findByIdAndRemove({
    _id: id,
    owner: userId,
  });
  return result;
};
const addContact = async (userId, body) => {
  const result = await Contacts.create({ ...body, owner: userId });
  return result;
};

const updateContact = async (userId, id, body) => {
  const result = await Contacts.findByIdAndUpdate(
    {
      _id: id,
      owner: userId,
    },
    { ...body },
    { new: true },
  );
  return result;
};

module.exports = {
  listContacts,
  getById,
  removeContact,
  addContact,
  updateContact,
};