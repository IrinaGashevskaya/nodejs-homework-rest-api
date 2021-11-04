const mongoose = require('mongoose');
const { Schema, model, SchemaTypes } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
     owner: {
      type: SchemaTypes.ObjectId,
      ref: 'user',
    },
  },
  {
    versionKey: false,
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  },
);

contactSchema.path('name').validate(value => {
  const result = /[A-Z]\w+/;
  return result.test(String(value));
});

contactSchema.path('email').validate(value => {
  const result = /([a-z0-9_\.-]+)@([a-z0-9_\.-]+)\.([a-z\.]{2,6})/;
  return result.test(String(value));
});

contactSchema.path('phone').validate(value => {
  const result = /[(][0-9]{3}[)][\s][0-9]{3}[-][0-9]{4}/;
  return result.test(String(value));
});
contactSchema.plugin(mongoosePaginate);
const Contact = model('contacts', contactSchema);

module.exports = Contact;