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
  const adminTagDefs = [
    { name: 'vip', color: '#ef4444' },
    { name: 'partner', color: '#3b82f6' },
    { name: 'investor', color: '#8b5cf6' },
    { name: 'enterprise', color: '#0ea5e9' },
    { name: 'newsletter', color: '#14b8a6' },
  ];

  const demoTagDefs = [
    { name: 'lead', color: '#f59e0b' },
    { name: 'follow-up', color: '#10b981' },
    { name: 'customer', color: '#22c55e' },
    { name: 'trial', color: '#f97316' },
    { name: 'priority', color: '#ec4899' },
  ];

  const tags = await Tag.create([
    ...adminTagDefs.map((tag) => ({ ...tag, user: adminUser._id })),
    ...demoTagDefs.map((tag) => ({ ...tag, user: demoUser._id })),
  ]);

  return {
    adminTags: tags.slice(0, adminTagDefs.length),
    demoTags: tags.slice(adminTagDefs.length),
  };
};

const seedContacts = async ({ adminUser, demoUser, tags }) => {
  const firstNames = [
    'Alex',
    'Bailey',
    'Cameron',
    'Drew',
    'Elliot',
    'Finley',
    'Gray',
    'Harper',
    'Indigo',
    'Jordan',
    'Kai',
    'Logan',
    'Morgan',
    'Noel',
    'Parker',
    'Quinn',
    'Reese',
    'Sawyer',
    'Taylor',
    'Avery',
    'Riley',
    'Casey',
    'Skyler',
    'Rowan',
    'Emerson',
  ];

  const lastNames = [
    'Adams',
    'Bennett',
    'Carter',
    'Diaz',
    'Edwards',
    'Foster',
    'Garcia',
    'Hayes',
    'Irwin',
    'James',
    'Knight',
    'Lopez',
    'Mitchell',
    'Nguyen',
    'Owens',
    'Patel',
    'Quincy',
    'Reed',
    'Stewart',
    'Turner',
    'Underwood',
    'Vargas',
    'Walker',
    'Young',
    'Zimmerman',
  ];

  const companies = [
    'Northwind Labs',
    'BlueSky Ventures',
    'Summit Dynamics',
    'Cedar Hill Media',
    'Brightline Tech',
    'Horizon Partners',
    'Granite Analytics',
    'Atlas Commerce',
    'Nimbus Security',
    'Evergreen Systems',
  ];

  const jobTitles = [
    'Founder',
    'CTO',
    'Product Manager',
    'Marketing Director',
    'Sales Lead',
    'Operations Manager',
    'Engineer',
    'Customer Success Manager',
    'VP Growth',
    'Head of Partnerships',
  ];

  const statuses = ['lead', 'active', 'inactive', 'warm', 'cold'];

  const buildContact = (owner, ownerPrefix, index, ownerTags) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[index % lastNames.length];
    const organization = companies[index % companies.length];
    const jobTitle = jobTitles[index % jobTitles.length];
    const status = statuses[index % statuses.length];
    const primaryTag = ownerTags[index % ownerTags.length];
    const secondaryTag = ownerTags[(index + 2) % ownerTags.length];
    const tertiaryTag = ownerTags[(index + 4) % ownerTags.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${ownerPrefix}${index + 1}@example.com`;
    const phone = `+1-415-555-${String(1000 + index).slice(-4)}`;

    const assignedTags = [primaryTag._id];
    if (index % 2 === 0) {
      assignedTags.push(secondaryTag._id);
    }
    if (index % 5 === 0) {
      assignedTags.push(tertiaryTag._id);
    }

    return {
      owner,
      firstName,
      lastName,
      organization,
      jobTitle,
      status,
      lastContacted: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
      contactMethods: [
        { type: 'email', value: email, label: 'work', isPrimary: true },
        { type: 'phone', value: phone, label: 'work' },
        {
          type: 'linkedin',
          value: `linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}${ownerPrefix}${index + 1}`,
          label: 'work',
        },
      ],
      tags: assignedTags,
    };
  };

  const adminContacts = Array.from({ length: 25 }, (_, index) =>
    buildContact(adminUser._id, 'a', index, tags.adminTags)
  );

  const demoContacts = Array.from({ length: 25 }, (_, index) =>
    buildContact(demoUser._id, 'd', index + 25, tags.demoTags)
  );

  const contacts = await Contact.create([...adminContacts, ...demoContacts]);

  return {
    adminContact: contacts.find((contact) => String(contact.owner) === String(adminUser._id)),
    demoContact: contacts.find((contact) => String(contact.owner) === String(demoUser._id)),
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
