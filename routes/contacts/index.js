const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/contacts');
const validator = require('../../validations/valid-contacts-router');
const guard = require('../../helper/guard');
const handlerError = require('../../helper/helper-errors');
const { Subscription } = require('../../helper/constants');
const subscription = require('../../helper/subscription');

router
  .get('/', guard, validator.queryContact, ctrl.getAll)
  .post('/', guard, validator.addContact, handlerError(ctrl.addContact));

router.get('/pro', guard, subscription(Subscription.PRO), ctrl.onlyPro);
router.get(
  '/bussiness',
  guard,
  subscription(Subscription.BUSINESS),
  ctrl.onlyBussines,
);

router
  .get('/:contactId', guard, validator.objectId, ctrl.getById)
  .delete('/:contactId', guard, validator.objectId, ctrl.deleteContact)
  .put('/:contactId', guard, validator.updateContact, ctrl.updateContact);

router.patch(
  '/:contactId/favorite',
  guard,
  validator.updateContact,
  ctrl.updateStatus,
);

module.exports = router;