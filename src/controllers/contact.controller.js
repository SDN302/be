const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { contactService } = require('../services');

const createContact = catchAsync(async (req, res) => {
    const contact = await contactService.createContact(req.user.id, req.body);
    res.status(httpStatus.CREATED).send(contact);
});

const getContacts = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['firstName', 'lastName', 'organization', 'status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const result = await contactService.queryContacts(req.user.id, filter, options);
    res.send(result);
});

const getContact = catchAsync(async (req, res) => {
    const contact = await contactService.getContactById(req.params.contactId, req.user.id);
    if (!contact) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
    }
    res.send(contact);
});

const updateContact = catchAsync(async (req, res) => {
    const contact = await contactService.updateContactById(req.params.contactId, req.user.id, req.body);
    res.send(contact);
});

const deleteContact = catchAsync(async (req, res) => {
    await contactService.deleteContactById(req.params.contactId, req.user.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const addContactMethod = catchAsync(async (req, res) => {
    const contact = await contactService.addContactMethod(req.params.contactId, req.user.id, req.body);
    res.send(contact);
});

const removeContactMethod = catchAsync(async (req, res) => {
    const contact = await contactService.removeContactMethod(req.params.contactId, req.user.id, req.params.methodId);
    res.send(contact);
});

const addTags = catchAsync(async (req, res) => {
    const contact = await contactService.addTags(req.params.contactId, req.user.id, req.body.tagIds);
    res.send(contact);
});

const removeTag = catchAsync(async (req, res) => {
    const contact = await contactService.removeTag(req.params.contactId, req.user.id, req.params.tagId);
    res.send(contact);
});

module.exports = {
    createContact,
    getContacts,
    getContact,
    updateContact,
    deleteContact,
    addContactMethod,
    removeContactMethod,
    addTags,
    removeTag,
};
