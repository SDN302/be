const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const contactMethodSchema = mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['email', 'phone', 'linkedin', 'telegram', 'whatsapp'],
            required: true,
        },
        value: {
            type: String,
            required: true,
            trim: true,
        },
        label: {
            type: String,
            enum: ['personal', 'work', 'other'],
            default: 'personal',
        },
        isPrimary: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true }
);

const contactSchema = mongoose.Schema(
    {
        owner: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        organization: {
            type: String,
            trim: true,
        },
        jobTitle: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['lead', 'active', 'inactive', 'warm', 'cold'],
            default: 'active',
        },
        lastContacted: {
            type: Date,
        },
        birthday: {
            type: Date,
        },
        contactMethods: [contactMethodSchema],
        tags: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'Tag',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
contactSchema.plugin(toJSON);
contactSchema.plugin(paginate);

/**
 * @typedef Contact
 */
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
