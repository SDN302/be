const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Contact } = require('../../src/models');
const { userOne, admin, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Contact routes - referral relationships', () => {
    describe('POST /v1/contacts', () => {
        test('should create a contact with a valid referralContactId', async () => {
            await insertUsers([userOne]);
            const referrer = await Contact.create({
                owner: userOne._id,
                firstName: 'Alice',
                lastName: 'Referrer',
            });

            const newContact = {
                firstName: 'Bob',
                lastName: 'Lead',
                referralContactId: referrer.id,
            };

            const res = await request(app)
                .post('/v1/contacts')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send(newContact)
                .expect(httpStatus.CREATED);

            expect(res.body).toMatchObject({
                firstName: newContact.firstName,
                lastName: newContact.lastName,
                referralContactId: referrer.id,
            });

            const dbContact = await Contact.findById(res.body.id);
            expect(dbContact).toBeTruthy();
            expect(dbContact.referralContactId.toString()).toBe(referrer.id);
        });

        test('should return 400 if referralContactId does not belong to current user', async () => {
            await insertUsers([userOne, admin]);
            const otherOwnerContact = await Contact.create({
                owner: admin._id,
                firstName: 'Admin',
                lastName: 'Owned',
            });

            const res = await request(app)
                .post('/v1/contacts')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({
                    firstName: 'Charlie',
                    lastName: 'InvalidReferral',
                    referralContactId: otherOwnerContact.id,
                })
                .expect(httpStatus.BAD_REQUEST);

            expect(res.body).toEqual({
                code: httpStatus.BAD_REQUEST,
                message: 'Referral contact not found',
            });
        });
    });

    describe('PATCH /v1/contacts/:contactId', () => {
        test('should return 400 when setting referralContactId to self', async () => {
            await insertUsers([userOne]);
            const contact = await Contact.create({
                owner: userOne._id,
                firstName: 'Self',
                lastName: 'Ref',
            });

            const res = await request(app)
                .patch(`/v1/contacts/${contact.id}`)
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .send({ referralContactId: contact.id })
                .expect(httpStatus.BAD_REQUEST);

            expect(res.body).toEqual({
                code: httpStatus.BAD_REQUEST,
                message: 'A contact cannot refer itself',
            });
        });
    });

    describe('GET /v1/contacts', () => {
        test('should filter contacts by referralContactId', async () => {
            await insertUsers([userOne]);
            const referrer = await Contact.create({
                owner: userOne._id,
                firstName: 'Diana',
                lastName: 'Referrer',
            });
            await Contact.create({
                owner: userOne._id,
                firstName: 'Evan',
                lastName: 'Referred',
                referralContactId: referrer._id,
            });
            await Contact.create({
                owner: userOne._id,
                firstName: 'Frank',
                lastName: 'Direct',
            });

            const res = await request(app)
                .get('/v1/contacts')
                .set('Authorization', `Bearer ${userOneAccessToken}`)
                .query({ referralContactId: referrer.id })
                .expect(httpStatus.OK);

            expect(res.body.totalResults).toBe(1);
            expect(res.body.results).toHaveLength(1);
            expect(res.body.results[0]).toMatchObject({
                firstName: 'Evan',
                referralContactId: referrer.id,
            });
        });
    });
});
