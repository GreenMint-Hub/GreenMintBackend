if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

export const databaseConfig = {
  uri: process.env.MONGODB_URI,
};
