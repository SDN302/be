const mongoose = require('mongoose');
const config = require('./config/config');
const logger = require('./config/logger');
const { User, Contact, Tag, Interaction, Token } = require('./models');

const seedUsers = async () => {
  const users = await User.create([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password1',
      role: 'admin',
      isEmailVerified: true,
    },
    {
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password1',
      role: 'user',
      isEmailVerified: true,
    },
  ]);

  return {
    adminUser: users[0],
    demoUser: users[1],
  };
};

const seedTags = async ({ adminUser, demoUser }) => {
  const tags = await Tag.create([
    { name: 'vip', color: '#ef4444', user: adminUser._id },
    { name: 'partner', color: '#3b82f6', user: adminUser._id },
    { name: 'lead', color: '#f59e0b', user: demoUser._id },
    { name: 'follow-up', color: '#10b981', user: demoUser._id },
  ]);

  return {
    adminVipTag: tags[0],
    adminPartnerTag: tags[1],
    demoLeadTag: tags[2],
    demoFollowUpTag: tags[3],
  };
};

const seedContacts = async ({ adminUser, demoUser, tags }) => {
  const contacts = await Contact.create([
    {
      owner: adminUser._id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      organization: 'Northwind Labs',
      jobTitle: 'CTO',
      status: 'active',
      lastContacted: new Date('2026-03-10T10:00:00.000Z'),
      contactMethods: [
        { type: 'email', value: 'sarah@northwindlabs.com', label: 'work', isPrimary: true },
        { type: 'linkedin', value: 'linkedin.com/in/sarahjohnson', label: 'work' },
      ],
      tags: [tags.adminVipTag._id, tags.adminPartnerTag._id],
    },
    {
      owner: demoUser._id,
      firstName: 'Michael',
      lastName: 'Brown',
      organization: 'BlueSky Ventures',
      jobTitle: 'Founder',
      status: 'lead',
      lastContacted: new Date('2026-03-12T14:30:00.000Z'),
      contactMethods: [
        { type: 'email', value: 'michael@bluesky.vc', label: 'work', isPrimary: true },
        { type: 'phone', value: '+1-415-555-0123', label: 'work' },
      ],
      tags: [tags.demoLeadTag._id, tags.demoFollowUpTag._id],
    },
  ]);

  return {
    adminContact: contacts[0],
    demoContact: contacts[1],
  };
};

const seedInteractions = async ({ adminUser, demoUser, contacts }) => {
  await Interaction.create([
    {
      contact: contacts.adminContact._id,
      user: adminUser._id,
      type: 'meeting',
      summary: 'Quarterly product roadmap review',
      description: 'Discussed Q2 priorities and integration timeline.',
      occurredAt: new Date('2026-03-11T09:00:00.000Z'),
    },
    {
      contact: contacts.demoContact._id,
      user: demoUser._id,
      type: 'call',
      summary: 'Intro call for collaboration',
      description: 'Scheduled a follow-up demo for next week.',
      occurredAt: new Date('2026-03-13T16:00:00.000Z'),
    },
  ]);
};

const clearData = async () => {
  await Promise.all([
    Token.deleteMany({}),
    Interaction.deleteMany({}),
    Contact.deleteMany({}),
    Tag.deleteMany({}),
    User.deleteMany({}),
  ]);
};

const seedData = async () => {
  const seededUsers = await seedUsers();
  const seededTags = await seedTags(seededUsers);
  const seededContacts = await seedContacts({
    ...seededUsers,
    tags: seededTags,
  });
  await seedInteractions({
    ...seededUsers,
    contacts: seededContacts,
  });
};

const run = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');

    await clearData();
    await seedData();

    logger.info('Seed data created successfully');
    logger.info('Admin login: admin@example.com / password1');
    logger.info('Demo login: demo@example.com / password1');
  } catch (error) {
    logger.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
