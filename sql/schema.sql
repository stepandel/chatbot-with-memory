-- NextAuth.js PostgreSQL schema with UUID support
-- https://authjs.dev/getting-started/adapters/pg

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE verification_token
(
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,

  PRIMARY KEY (identifier, token)
);

CREATE TABLE accounts
(
  id UUID DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,

  PRIMARY KEY (id)
);

CREATE TABLE sessions
(
  id UUID DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,

  PRIMARY KEY (id)
);

CREATE TABLE users
(
  id UUID DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT,

  PRIMARY KEY (id)
);

CREATE TABLE authenticators
(
  "credentialID" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  "credentialPublicKey" TEXT NOT NULL,
  counter INTEGER NOT NULL,
  "credentialDeviceType" VARCHAR(255) NOT NULL,
  "credentialBackedUp" BOOLEAN NOT NULL,
  transports VARCHAR(255),

  PRIMARY KEY ("userId", "credentialID"),
  UNIQUE ("credentialID")
);

-- Foreign key constraints
ALTER TABLE accounts ADD FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE sessions ADD FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE authenticators ADD FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- Indexes for performance
CREATE UNIQUE INDEX accounts_provider_provider_account_id_key ON accounts(provider, "providerAccountId");
CREATE UNIQUE INDEX sessions_session_token_key ON sessions("sessionToken");
CREATE UNIQUE INDEX users_email_key ON users(email);