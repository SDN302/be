const express = require('express');
const auth = require('../../middlewares/auth');
const tagController = require("../../controllers/tag.controller")
const tagValidation = require("../../validations/tag.validation");
const validate = require('../../middlewares/validate');

const router = express.Router()

router
    .route('/')
    .get(auth(), tagController.getTags)
    .post(auth(), validate(tagValidation.createTag), tagController.createTag);

router
    .route('/:tagId')
    .patch(auth(), validate(tagValidation.updateTag), tagController.updateTag)
    .delete(auth(), validate(tagValidation.deleteTag), tagController.deleteTag)

module.exports = router

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Tag management for contacts
 */

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get all tags
 *     description: Retrieve all tags for the logged in user.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   post:
 *     summary: Create a tag
 *     description: Create a new tag for the logged in user.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *                 pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *             example:
 *               name: important
 *               color: '#ff6b35'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       "400":
 *         $ref: '#/components/responses/DuplicateTag'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /tags/{tagId}:
 *   patch:
 *     summary: Update a tag
 *     description: Update a specific tag for the logged in user.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *                 pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *             example:
 *               name: warm-lead
 *               color: '#2a9d8f'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       "400":
 *         $ref: '#/components/responses/DuplicateTag'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a tag
 *     description: Delete a specific tag for the logged in user.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */