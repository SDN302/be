const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const contactValidation = require('../../validations/contact.validation');
const contactController = require('../../controllers/contact.controller');

const router = express.Router();

router
    .route('/')
    .post(auth(), validate(contactValidation.createContact), contactController.createContact)
    .get(auth(), validate(contactValidation.getContacts), contactController.getContacts);

router
    .route('/:contactId')
    .get(auth(), validate(contactValidation.getContact), contactController.getContact)
    .patch(auth(), validate(contactValidation.updateContact), contactController.updateContact)
    .delete(auth(), validate(contactValidation.deleteContact), contactController.deleteContact);

router
    .route('/:contactId/methods')
    .post(auth(), validate(contactValidation.addContactMethod), contactController.addContactMethod);

router
    .route('/:contactId/methods/:methodId')
    .delete(auth(), validate(contactValidation.removeContactMethod), contactController.removeContactMethod);

router
    .route('/:contactId/tags')
    .post(auth(), validate(contactValidation.addTags), contactController.addTags);

router
    .route('/:contactId/tags/:tagId')
    .delete(auth(), validate(contactValidation.removeTag), contactController.removeTag);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Contact management and retrieval
 */

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Create a contact
 *     description: Logged in users can create contacts.
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               organization:
 *                 type: string
 *               jobTitle:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [lead, active, inactive, warm, cold]
 *               lastContacted:
 *                 type: string
 *                 format: date-time
 *               birthday:
 *                 type: string
 *                 format: date
 *               contactMethods:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [email, phone, linkedin, telegram, whatsapp]
 *                     value:
 *                       type: string
 *                     label:
 *                       type: string
 *                       enum: [personal, work, other]
 *                     isPrimary:
 *                       type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               firstName: John
 *               lastName: Doe
 *               organization: Acme Inc
 *               jobTitle: Developer
 *               status: active
 *               contactMethods:
 *                 - type: email
 *                   value: john@example.com
 *                   label: work
 *                   isPrimary: true
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contact'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: Get all contacts
 *     description: Retrieve all contacts for the logged in user.
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *         description: Filter by first name
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *         description: Filter by last name
 *       - in: query
 *         name: organization
 *         schema:
 *           type: string
 *         description: Filter by organization
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [lead, active, inactive, warm, cold]
 *         description: Filter by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. firstName:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of contacts
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /contacts/{contactId}:
 *   get:
 *     summary: Get a contact
 *     description: Retrieve a specific contact by ID.
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contact'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a contact
 *     description: Update a specific contact by ID.
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               organization:
 *                 type: string
 *               jobTitle:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [lead, active, inactive, warm, cold]
 *               lastContacted:
 *                 type: string
 *                 format: date-time
 *               birthday:
 *                 type: string
 *                 format: date
 *             example:
 *               firstName: Jane
 *               organization: New Company
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contact'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a contact
 *     description: Delete a specific contact by ID.
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /contacts/{contactId}/methods:
 *   post:
 *     summary: Add a contact method
 *     description: Add a new contact method (email, phone, etc.) to a contact.
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - value
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [email, phone, linkedin, telegram, whatsapp]
 *               value:
 *                 type: string
 *               label:
 *                 type: string
 *                 enum: [personal, work, other]
 *               isPrimary:
 *                 type: boolean
 *             example:
 *               type: phone
 *               value: "+1234567890"
 *               label: work
 *               isPrimary: false
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contact'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /contacts/{contactId}/methods/{methodId}:
 *   delete:
 *     summary: Remove a contact method
 *     description: Remove a contact method from a contact.
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact id
 *       - in: path
 *         name: methodId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact method id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contact'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /contacts/{contactId}/tags:
 *   post:
 *     summary: Add tags to a contact
 *     description: Add one or more tags to a contact.
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagIds
 *             properties:
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               tagIds: ["60d5ec49b784e34d8c8f8f8f"]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contact'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /contacts/{contactId}/tags/{tagId}:
 *   delete:
 *     summary: Remove a tag from a contact
 *     description: Remove a specific tag from a contact.
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact id
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contact'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
