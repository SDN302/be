const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const tagSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        color: {
            type: String,
            trim: true,
            validate(value) {
                if (value && !value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
                    throw new Error('Invalid hex color code');
                }
            },
        },
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
tagSchema.plugin(toJSON);
tagSchema.plugin(paginate);

// Compound index to ensure unique tag names per user
tagSchema.index({ name: 1, user: 1 }, { unique: true });

/**
 * @typedef Tag
 */
const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
