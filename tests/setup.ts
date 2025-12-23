import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var __MONGO_INSTANCE__: MongoMemoryServer | undefined;
}

beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.API_KEY_PREFIX = 'ss_test_';
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';

  // Connect to in-memory MongoDB if not already connected
  if (mongoose.connection.readyState === 0 && global.__MONGO_INSTANCE__) {
    const uri = global.__MONGO_INSTANCE__.getUri();
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  // Disconnect from MongoDB
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

afterEach(async () => {
  // Clear all collections after each test
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
