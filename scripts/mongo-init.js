// =============================================
// Screenshot API - MongoDB Initialization
// Creates database user and indexes
// =============================================

// Switch to screenshot-api database
db = db.getSiblingDB('screenshot-api');

// Create application user
db.createUser({
  user: 'screenshot_api_user',
  pwd: process.env.MONGO_APP_PASSWORD || 'changeme',
  roles: [
    {
      role: 'readWrite',
      db: 'screenshot-api',
    },
  ],
});

print('Created application user');

// Create indexes for users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ 'subscription.stripeCustomerId': 1 }, { sparse: true });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: -1 });

print('Created users indexes');

// Create indexes for apikeys collection
db.apikeys.createIndex({ keyHash: 1 }, { unique: true });
db.apikeys.createIndex({ user: 1 });
db.apikeys.createIndex({ isActive: 1 });
db.apikeys.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

print('Created apikeys indexes');

// Create indexes for screenshots collection
db.screenshots.createIndex({ user: 1, createdAt: -1 });
db.screenshots.createIndex({ 'result.status': 1 });
db.screenshots.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.screenshots.createIndex({ apiKey: 1 });
db.screenshots.createIndex({ url: 1 });
db.screenshots.createIndex({ createdAt: -1 });

print('Created screenshots indexes');

// Create indexes for usages collection
db.usages.createIndex({ user: 1, date: -1 });
db.usages.createIndex({ apiKey: 1 });
db.usages.createIndex({ date: -1 });

print('Created usages indexes');

// Create indexes for refreshtokens collection
db.refreshtokens.createIndex({ userId: 1 });
db.refreshtokens.createIndex({ tokenHash: 1 }, { unique: true });
db.refreshtokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('Created refreshtokens indexes');

print('MongoDB initialization completed successfully');
