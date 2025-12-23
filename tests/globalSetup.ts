import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  // eslint-disable-next-line no-var
  var __MONGO_INSTANCE__: MongoMemoryServer | undefined;
  // eslint-disable-next-line no-var
  var __MONGO_URI__: string | undefined;
}

export default async function globalSetup(): Promise<void> {
  // Create MongoDB Memory Server instance
  const instance = await MongoMemoryServer.create({
    binary: {
      version: '7.0.4',
    },
  });

  const uri = instance.getUri();

  // Store for global access
  global.__MONGO_INSTANCE__ = instance;
  global.__MONGO_URI__ = uri;

  // Set environment variable for tests
  process.env.MONGODB_URI = uri;
}
