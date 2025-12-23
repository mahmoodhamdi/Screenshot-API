import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  // eslint-disable-next-line no-var
  var __MONGO_INSTANCE__: MongoMemoryServer | undefined;
}

export default async function globalTeardown(): Promise<void> {
  // Stop MongoDB Memory Server
  if (global.__MONGO_INSTANCE__) {
    await global.__MONGO_INSTANCE__.stop();
    global.__MONGO_INSTANCE__ = undefined;
  }
}
