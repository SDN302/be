const httpStatus = require('http-status');
const { Contact } = require('../models');
const ApiError = require('../utils/ApiError');

const buildTagsFilter = (tags) => {
    if (!tags) {
        return {};
    }

    const tagIds = Array.isArray(tags) ? tags : tags.split(',').map((tag) => tag.trim());
    if (tagIds.length === 1) {
        return { tags: tagIds[0] };
    }

    return { tags: { $in: tagIds } };
};

const validateReferralContact = async (userId, referralContactId, currentContactId = null) => {
    if (!referralContactId) {
        return;
    }

    if (currentContactId && referralContactId.toString() === currentContactId.toString()) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'A contact cannot refer itself');
    }

    const referralContact = await Contact.findOne({ _id: referralContactId, owner: userId }).select('_id referralContactId');
    if (!referralContact) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Referral contact not found');
    }

    if (!currentContactId) {
        return;
    }

    const visited = new Set([referralContact._id.toString()]);
    let cursor = referralContact;
    while (cursor.referralContactId) {
        const parentId = cursor.referralContactId.toString();

        if (parentId === currentContactId.toString()) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Circular referral relationship is not allowed');
        }

        if (visited.has(parentId)) {
            break;
        }

        visited.add(parentId);
        cursor = await Contact.findOne({ _id: parentId, owner: userId }).select('_id referralContactId');
        if (!cursor) {
            break;
        }
    }
};

/**
 * Create a contact
 * @param {ObjectId} userId - Owner's user id
 * @param {Object} contactBody
 * @returns {Promise<Contact>}
 */
const createContact = async (userId, contactBody) => {
    await validateReferralContact(userId, contactBody.referralContactId);
    return Contact.create({ ...contactBody, owner: userId });
};

/**
 * Query for contacts
 * @param {ObjectId} userId - Owner's user id
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - Populate data fields
 * @returns {Promise<QueryResult>}
 */
const queryContacts = async (userId, filter, options) => {
    const { tags, ...restFilter } = filter;
    const contacts = await Contact.paginate({ ...restFilter, ...buildTagsFilter(tags), owner: userId }, options);
    return contacts;
};

/**
 * Get contact by id
 * @param {ObjectId} id
 * @param {ObjectId} userId - Owner's user id
 * @returns {Promise<Contact>}
 */
const getContactById = async (id, userId) => {
    return Contact.findOne({ _id: id, owner: userId }).populate('tags');
};

/**
 * Update contact by id
 * @param {ObjectId} contactId
 * @param {ObjectId} userId - Owner's user id
 * @param {Object} updateBody
 * @returns {Promise<Contact>}
 */
const updateContactById = async (contactId, userId, updateBody) => {
    const contact = await getContactById(contactId, userId);
    if (!contact) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
    }

    if (Object.prototype.hasOwnProperty.call(updateBody, 'referralContactId') && updateBody.referralContactId !== null) {
        await validateReferralContact(userId, updateBody.referralContactId, contact._id);
    }

    Object.assign(contact, updateBody);
    await contact.save();
    return contact;
};

/**
 * Delete contact by id
 * @param {ObjectId} contactId
 * @param {ObjectId} userId - Owner's user id
 * @returns {Promise<Contact>}
 */
const deleteContactById = async (contactId, userId) => {
    const contact = await getContactById(contactId, userId);
    if (!contact) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
    }
    await contact.remove();
    return contact;
};

/**
 * Add contact method to contact
 * @param {ObjectId} contactId
 * @param {ObjectId} userId - Owner's user id
 * @param {Object} contactMethod
 * @returns {Promise<Contact>}
 */
const addContactMethod = async (contactId, userId, contactMethod) => {
    const contact = await getContactById(contactId, userId);
    if (!contact) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
    }
    contact.contactMethods.push(contactMethod);
    await contact.save();
    return contact;
};

/**
 * Remove contact method from contact
 * @param {ObjectId} contactId
 * @param {ObjectId} userId - Owner's user id
 * @param {ObjectId} methodId
 * @returns {Promise<Contact>}
 */
const removeContactMethod = async (contactId, userId, methodId) => {
    const contact = await getContactById(contactId, userId);
    if (!contact) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
    }
    contact.contactMethods.id(methodId).remove();
    await contact.save();
    return contact;
};

/**
 * Add tags to contact
 * @param {ObjectId} contactId
 * @param {ObjectId} userId - Owner's user id
 * @param {Array<ObjectId>} tagIds
 * @returns {Promise<Contact>}
 */
const addTags = async (contactId, userId, tagIds) => {
    const contact = await getContactById(contactId, userId);
    if (!contact) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
    }
    const uniqueTags = [...new Set([...contact.tags.map((t) => t.toString()), ...tagIds])];
    contact.tags = uniqueTags;
    await contact.save();
    return contact;
};

/**
 * Remove tag from contact
 * @param {ObjectId} contactId
 * @param {ObjectId} userId - Owner's user id
 * @param {ObjectId} tagId
 * @returns {Promise<Contact>}
 */
const removeTag = async (contactId, userId, tagId) => {
    const contact = await getContactById(contactId, userId);
    if (!contact) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
    }
    contact.tags = contact.tags.filter((t) => t.toString() !== tagId);
    await contact.save();
    return contact;
};

module.exports = {
    createContact,
    queryContacts,
    getContactById,
    updateContactById,
    deleteContactById,
    addContactMethod,
    removeContactMethod,
    addTags,
    removeTag,
};
