const httpStatus = require('http-status');
const { Tag, Contact } = require('../models');
const ApiError = require('../utils/ApiError');

const createTag = async (userId, tagBody) => {
  try {
    return await Tag.create({ ...tagBody, user: userId });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Tag already exists');
    }
    throw error;
  }
};

const queryTags = async (userId) => {
  return Tag.find({ user: userId });
};

const getTagById = async (tagId, userId) => {
  return Tag.findOne({ _id: tagId, user: userId });
};

const updateTagById = async (tagId, userId, updateBody) => {
  const tag = await getTagById(tagId, userId);
  if (!tag) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tag not found');
  }

  Object.assign(tag, updateBody);

  try {
    await tag.save();
    return tag;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Tag already exists');
    }
    throw error;
  }
};

const deleteTagById = async (tagId, userId) => {
  const tag = await getTagById(tagId, userId);
  if (!tag) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tag not found');
  }

  await Contact.updateMany({ owner: userId }, { $pull: { tags: tag._id } });
  await tag.remove();
  return tag;
};

module.exports = {
  createTag,
  queryTags,
  getTagById,
  updateTagById,
  deleteTagById,
};
