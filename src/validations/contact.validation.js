const Joi = require('joi');
const { objectId } = require('./custom.validation');

const contactMethodSchema = Joi.object().keys({
    type: Joi.string().required().valid('email', 'phone', 'linkedin', 'telegram', 'whatsapp'),
    value: Joi.string().required().trim(),
    label: Joi.string().valid('personal', 'work', 'other').default('personal'),
    isPrimary: Joi.boolean().default(false),
});

const createContact = {
    body: Joi.object().keys({
        firstName: Joi.string().required().trim(),
        lastName: Joi.string().required().trim(),
        organization: Joi.string().trim(),
        jobTitle: Joi.string().trim(),
        status: Joi.string().valid('lead', 'active', 'inactive', 'warm', 'cold').default('active'),
        lastContacted: Joi.date(),
        birthday: Joi.date(),
        contactMethods: Joi.array().items(contactMethodSchema),
        referralContactId: Joi.string().custom(objectId),
        tags: Joi.array().items(Joi.string().custom(objectId)),
    }),
};

const getContacts = {
    query: Joi.object().keys({
        firstName: Joi.string(),
        lastName: Joi.string(),
        organization: Joi.string(),
        status: Joi.string().valid('lead', 'active', 'inactive', 'warm', 'cold'),
        referralContactId: Joi.string().custom(objectId),
        tags: Joi.alternatives().try(
            Joi.string().custom(objectId),
            Joi.array().items(Joi.string().custom(objectId)).min(1),
            Joi.string().pattern(/^([0-9a-fA-F]{24})(,[0-9a-fA-F]{24})+$/)
        ),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
        populate: Joi.string(),
    }),
};

const getContact = {
    params: Joi.object().keys({
        contactId: Joi.string().custom(objectId),
    }),
};

const updateContact = {
    params: Joi.object().keys({
        contactId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            firstName: Joi.string().trim(),
            lastName: Joi.string().trim(),
            organization: Joi.string().trim().allow(''),
            jobTitle: Joi.string().trim().allow(''),
            status: Joi.string().valid('lead', 'active', 'inactive', 'warm', 'cold'),
            lastContacted: Joi.date(),
            birthday: Joi.date().allow(null),
            referralContactId: Joi.alternatives().try(Joi.string().custom(objectId), Joi.valid(null)),
            contactMethods: Joi.array().items(contactMethodSchema),
            tags: Joi.array().items(Joi.string().custom(objectId)),
        })
        .min(1),
};

const deleteContact = {
    params: Joi.object().keys({
        contactId: Joi.string().custom(objectId),
    }),
};

const addContactMethod = {
    params: Joi.object().keys({
        contactId: Joi.string().custom(objectId),
    }),
    body: contactMethodSchema,
};

const removeContactMethod = {
    params: Joi.object().keys({
        contactId: Joi.string().custom(objectId),
        methodId: Joi.string().custom(objectId),
    }),
};

const addTags = {
    params: Joi.object().keys({
        contactId: Joi.string().custom(objectId),
    }),
    body: Joi.object().keys({
        tagIds: Joi.array().items(Joi.string().custom(objectId)).required().min(1),
    }),
};

const removeTag = {
    params: Joi.object().keys({
        contactId: Joi.string().custom(objectId),
        tagId: Joi.string().custom(objectId),
    }),
};

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
