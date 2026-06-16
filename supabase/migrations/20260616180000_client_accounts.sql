-- Client self-service accounts: email + password login for the /account portal.
--
-- A client books with their email, then optionally sets a password to create an
-- account. From then on they log in with email + password to see upcoming and
-- past appointments. Bookings themselves stay keyed by client_email on the
-- bookings table — this table only holds the credential, keyed by the same
-- (lower-cased) email, so a single account sees every booking made with it.
--
-- The password is never stored in the clear: password_hash is a scrypt digest
-- (scheme$salt$hash, see src/lib/account/password.ts). RLS is on with NO
-- policies, so only the service-role key (server-side, inside the /api/account
-- route handlers) can read or write it.
CREATE TABLE IF NOT EXISTS client_accounts (
  email text PRIMARY KEY,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE client_accounts ENABLE ROW LEVEL SECURITY;
