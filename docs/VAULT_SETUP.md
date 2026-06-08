# Vault Setup — Bitwarden (one-time, ~30 minutes)

This is the practical checklist for setting up the password vault referenced in
`DISASTER_RECOVERY.md`. Do it once. Only the person who holds the passwords
(Giles) can do the typing — by design, no one else ever sees the secrets.

Why Bitwarden: cheapest route that includes **Emergency Access** (the
"press one button, wait, the vault opens" handover). You need the **Premium**
tier — about **£10 / $10 a year**. The person receiving access only needs a
**free** account.

---

## Step 1 — Create the vault (5 min)

1. Go to **https://bitwarden.com** and create an account, using the **business
   email** as the username.
2. Set a strong **master password** and write it on the break-glass card (the
   one index card in the safe). This is the one password that protects all the
   others — it is never stored anywhere digital.
3. Upgrade to **Premium** (Settings → upgrade). ~£10/year. Required for
   emergency access.
4. Turn on **two-step login** (Settings → Security) and save the recovery code
   onto the break-glass card too.

## Step 2 — Add the 13 logins (the main 20 min)

Create one vault item per system. For each, store: the **login email**, the
**password**, and any **2FA recovery codes** (in the item's notes field).

Work top-down — most important first:

- [ ] 1. Business email
- [ ] 2. Vercel
- [ ] 3. Supabase  *(client database — most sensitive)*
- [ ] 4. GitHub
- [ ] 5. Stripe
- [ ] 6. Domain registrar
- [ ] 7. Google (Business Profile + Cloud)
- [ ] 8. Microsoft 365
- [ ] 9. Twilio
- [ ] 10. Resend
- [ ] 11. Meta Business
- [ ] 12. Ovatu
- [ ] 13. Anthropic

> You do **not** need to copy the long API keys in by hand — those live inside
> Vercel. Storing the **Vercel login** (#2) is enough to reach them all. The
> vault just needs the front-door account logins.

## Step 3 — Turn on Emergency Access (5 min)

1. Settings → **Emergency Access** → **Add emergency contact**.
2. Enter the **business owner's email**. She accepts the invite from her own
   free Bitwarden account (she just creates one — no payment, nothing to learn).
3. Set the **access type** to **View** and the **wait time** to a period you're
   comfortable with — e.g. **7 days**. (If you ever don't respond to a request
   within that window, the vault opens to her automatically.)
4. Write the chosen wait time into `DISASTER_RECOVERY.md` (the blank in the
   Emergency Access section).

## Step 4 — Add the backup developer

Either add the backup developer as a **second emergency contact** (same as
Step 3), or rely on the owner handing them the vault when the time comes.
Record their name and number in `DISASTER_RECOVERY.md`.

---

## Done — what each person now holds

- **Giles:** the vault (everything), Premium subscription.
- **Business owner:** a free Bitwarden account named as emergency contact, plus
  the break-glass card in the safe. Her only ever action: request emergency
  access and call the backup developer.
- **Backup developer:** steps in with the vault when needed.

## Keep it current

Review monthly alongside `DISASTER_RECOVERY.md`: if a new service is added to
the site, add a vault item and a row in the recovery doc. Nothing secret ever
goes into the repo — only into Bitwarden.
