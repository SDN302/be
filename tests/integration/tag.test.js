const request = require('supertest');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Tag, Contact } = require('../../src/models');
const { userOne, admin, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Tag routes', () => {
    describe('POST /v1/tags', () => {
        test('should return 201 and create tag for authenticated user', async () => {
            await insertUsers([userOne]);

            const res = await request(app)
                .post('/v1/tags')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({ name: 'Urgent', color: '#ff0000' })
                .expect(httpStatus.CREATED);

            expect(res.body).toEqual({
                id: expect.any(String),
                name: 'urgent',
                color: '#ff0000',
                user: userOne._id.toHexString(),
            });

            const dbTag = await Tag.findById(res.body.id);
            expect(dbTag).toBeTruthy();
            expect(dbTag).toMatchObject({ name: 'urgent', color: '#ff0000', user: userOne._id });
        });

        test('should return 400 for duplicate tag name for the same user', async () => {
            await insertUsers([userOne]);
            await Tag.create({ name: 'Urgent', color: '#ff0000', user: userOne._id });

            const res = await request(app)
                .post('/v1/tags')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({ name: 'urgent', color: '#00ff00' })
                .expect(httpStatus.BAD_REQUEST);

            expect(res.body).toEqual({ code: httpStatus.BAD_REQUEST, message: 'Tag already exists' });
        });

        test('should return 400 when color is invalid', async () => {
            await insertUsers([userOne]);

            await request(app)
                .post('/v1/tags')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({ name: 'Urgent', color: 'red' })
                .expect(httpStatus.BAD_REQUEST);
        });
    });

    describe('GET /v1/tags', () => {
        test('should return only tags owned by authenticated user', async () => {
            await insertUsers([userOne, admin]);
            await Tag.create({ name: 'mine', color: '#000000', user: userOne._id });
            await Tag.create({ name: 'admin', color: '#ffffff', user: admin._id });

            const res = await request(app)
                .get('/v1/tags')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(httpStatus.OK);

            expect(res.body).toHaveLength(1);
            expect(res.body[0]).toMatchObject({
                name: 'mine',
                color: '#000000',
                user: userOne._id.toHexString(),
            });
        });
    });

    describe('PATCH /v1/tags/:tagId', () => {
        test('should update own tag', async () => {
            await insertUsers([userOne]);
            const tag = await Tag.create({ name: 'followup', color: '#0000ff', user: userOne._id });

            const res = await request(app)
                .patch(`/v1/tags/${tag.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({ name: 'important', color: '#123abc' })
                .expect(httpStatus.OK);

            expect(res.body).toMatchObject({
                id: tag.id,
                name: 'important',
                color: '#123abc',
            });

            const dbTag = await Tag.findById(tag.id);
            expect(dbTag).toMatchObject({ name: 'important', color: '#123abc' });
        });

        test('should return 404 when trying to update another user tag', async () => {
            await insertUsers([userOne, admin]);
            const adminTag = await Tag.create({ name: 'admin-only', color: '#abcdef', user: admin._id });

            const res = await request(app)
                .patch(`/v1/tags/${adminTag.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({ name: 'hijack' })
                .expect(httpStatus.NOT_FOUND);

            expect(res.body).toEqual({ code: httpStatus.NOT_FOUND, message: 'Tag not found' });
        });
    });

    describe('DELETE /v1/tags/:tagId', () => {
        test('should delete own tag and remove it from user contacts', async () => {
            await insertUsers([userOne]);
            const tag = await Tag.create({ name: 'obsolete', color: '#aaaaaa', user: userOne._id });
            const contact = await Contact.create({
                owner: userOne._id,
                firstName: 'Jane',
                lastName: 'Doe',
                tags: [tag._id],
            });

            await request(app)
                .delete(`/v1/tags/${tag.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(httpStatus.NO_CONTENT);

            const dbTag = await Tag.findById(tag.id);
            expect(dbTag).toBeNull();

            const dbContact = await Contact.findById(contact.id);
            expect(dbContact.tags).toHaveLength(0);
        });

        test('should return 404 when tag does not belong to user', async () => {
            await insertUsers([userOne, admin]);
            const adminTag = await Tag.create({ name: 'admin-only', color: '#111111', user: admin._id });

            const res = await request(app)
                .delete(`/v1/tags/${adminTag.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(httpStatus.NOT_FOUND);

            expect(res.body).toEqual({ code: httpStatus.NOT_FOUND, message: 'Tag not found' });
            const dbTag = await Tag.findById(adminTag.id);
            expect(dbTag).toBeTruthy();
        });

        test('should return 400 for invalid tag id', async () => {
            await insertUsers([userOne]);

            await request(app)
                .delete(`/v1/tags/${new mongoose.Types.ObjectId().toString().slice(0, 23)}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .expect(httpStatus.BAD_REQUEST);
        });

        test('should return 401 when not authenticated', async () => {
            await request(app).get('/v1/tags').expect(httpStatus.UNAUTHORIZED);
        });
    });
});
