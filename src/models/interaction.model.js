const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const interactionSchema = mongoose.Schema(
    {
        contact: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Contact',
            required: true,
        },
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['call', 'email', 'meeting', 'note', 'event'],
            required: true,
        },
        summary: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        occurredAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
interactionSchema.plugin(toJSON);
interactionSchema.plugin(paginate);

// Index for efficient queries by contact and user
interactionSchema.index({ contact: 1, occurredAt: -1 });
interactionSchema.index({ user: 1, occurredAt: -1 });

/**
 * @typedef Interaction
 */
const Interaction = mongoose.model('Interaction', interactionSchema);

module.exports = Interaction;
