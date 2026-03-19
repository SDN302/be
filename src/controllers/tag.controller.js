const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const tagService = require('../services/tag.service');

const getTags = catchAsync(async (req, res) => {
    const tags = await tagService.queryTags(req.user._id);
    res.send({
        tags
    });
});

const createTag = catchAsync(async (req, res) => {
    const tag = await tagService.createTag(req.user._id, req.body);
    res.status(httpStatus.CREATED).send({
        tag
    });
});

const updateTag = catchAsync(async (req, res) => {
    const tag = await tagService.updateTagById(req.params.tagId, req.user._id, req.body);
    res.send({
        tag
    });
});

const deleteTag = catchAsync(async (req, res) => {
    await tagService.deleteTagById(req.params.tagId, req.user._id);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    getTags,
    createTag,
    updateTag,
    deleteTag,
};
