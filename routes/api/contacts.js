const express = require("express");
const router = express.Router();
const Contact = require("../../model/contact");
const validate = require("./validation");

router.get('/', async (req, res, next) => {
  try {
    const contacts = await Contact.listContacts();
    return res.json({
      status: "Success",
      code: 200,
      data: {
        contacts,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', async (req, res, next) => {
  try {
    const contact = await Contact.getContactById(req.params.contactId);

    if (contact) {
      return res.json({
        status: "Success",
        code: 200,
        data: {
          contact,
        },
      });
    } else {
      return res.status(400).json({
        status: "Error",
        code: 400,
        message: "Not found",
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', validate.createContact, async (req, res, next) => {
  try {
    const contact = await Contact.addContact(req.body);
    return res.status(201).json({
      status: "Success",
      code: 201,
      message: "New contact has been added",
      data: {
        contact,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:contactId', async (req, res, next) => {
  try {
    const contact = await Contact.removeContact(req.params.contactId);

    if (contact) {
      return res.json({
        status: "Success",
        code: 200,
        message: "Contact has been deleted",
      });
    } else {
      return res.status(400).json({
        status: "Error",
        code: 404,
        message: "Not found",
      });
    }
  } catch (error) {
    next(error);
  }
});

router.patch('/:contactId', validate.updateContact, async (req, res, next) => {
  try {
    const contact = await Contact.updateContact(
      req.params.contactId,
      req.body
    );

    if (contact) {
      return res.json({
        status: "Success",
        code: 200,
        message: "Contact has been updated",
        data: {
          contact,
        },
      });
    } else {
      return res.status(400).json({
        status: "Error",
        code: 404,
        message: "Not found",
      });
    }
  } catch (error) {
    next(error);
  }
});
router.patch(
  '/:contactId/favorite',
  validate.updateContact,
  async (req, res, next) => {
    try {
      const contact = await Contact.updateContact(
        req.params.contactId,
        req.body,
      );
      if (contact) {
        return res.status(200).json({
          status: 'success',
          code: 200,
          message: 'contact update',
          data: { contact },
        });
      } else {
        return res.status(404).json({
          status: 'error',
          code: 404,
          data: 'Not found',
        });
      }
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;