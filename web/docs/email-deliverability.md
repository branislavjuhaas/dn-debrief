# Transactional e-mail deliverability

This runbook covers the e-mail DebRIEF sends through AWS SES: account
verification, password reset, event registration confirmation and club
membership confirmation. It exists because these messages were being sorted
into Gmail's **Promotions** tab, which makes users believe nothing was sent.

The code changes in this repository can only remove content signals that push
mail towards Promotions. Sender identity, DNS authentication and SES reputation
must be verified in the deployed environment using the checklist below.

## Sending identity

Transactional mail must use a dedicated sending subdomain, for example:

| Purpose                    | Domain / address                     |
| -------------------------- | ------------------------------------ |
| Transactional From address | `no-reply@mail.debrief.sda.sk`       |
| SES custom MAIL FROM       | `mail.debrief.sda.sk` (Return-Path)  |
| Bulk / campaign mail       | separate domain, never `mail.` above |

The visible From name should be human-readable (`DebRIEF`). Do not send
transactional mail from the same domain that is used for newsletters or
campaigns: a single bulk complaint can reclassify all mail from that domain.

Configured in the deployment environment:

| Variable                    | Purpose                                                                |
| --------------------------- | ---------------------------------------------------------------------- |
| `AWS_FROM_EMAIL`            | Transactional From address (`no-reply@mail.debrief.sda.sk`)            |
| `AWS_FROM_NAME`             | Display name (`DebRIEF`)                                               |
| `AWS_REPLY_TO_EMAIL`        | Optional Reply-To address that is actually monitored                   |
| `AWS_SES_CONFIGURATION_SET` | Optional SES configuration set for bounce/complaint event destinations |

## DNS and SES checklist

Record the result of each item in the findings table below.

### SPF

- The sending subdomain has a TXT record: `v=spf1 include:amazonses.com ~all`.
- If a custom MAIL FROM domain is used, its MX and SPF records are published as
  required by SES.
- There is exactly one SPF record per hostname.

### DKIM

- SES Easy DKIM is enabled with 2048-bit keys.
- All three CNAME records exist and resolve.
- A test message has a valid `DKIM-Signature` header for the sending domain.

### DMARC

- `_dmarc.mail.debrief.sda.sk` contains at least
  `v=DMARC1; p=none; rua=mailto:dmarc@debrief.sda.sk; adkim=s; aspf=s`.
- After a monitoring period without failures, tighten `p` to `quarantine` and
  then `reject`.
- The `From` domain and the Return-Path domain must align under strict
  alignment.

### SES

- The sending identity is verified in the SES region used by the application.
- The account is out of the SES sandbox.
- Bounce and complaint event destinations are configured and monitored.
- If a dedicated IP is used, it has been warmed up before production traffic.
- The configuration set enforces TLS where required.

## Content rules

The templates in `server/utils/mail.ts` (and their sources in `maizzle/emails/`)
must stay transactional:

- One clear action link per message, plus the link as plain text.
- No images, logos, web fonts, tracking pixels or link wrapping.
- No marketing wording, emoji or campaign copy.
- A plain-text alternative part is always sent (`sendEmail` does this).
- No `List-Unsubscribe` header on transactional mail.
- The recipient sees a real reply address when `AWS_REPLY_TO_EMAIL` is set.

## Verification procedure

Run this after any change to the sending domain, SES configuration or templates:

1. Send a verification e-mail and a registration confirmation to at least two
   Gmail accounts (one personal, one Workspace).
2. Check the inbox placement: **Inbox** or **Updates**, never **Promotions**
   or **Spam**.
3. Inspect the message headers and confirm:
   - `Authentication-Results` reports `spf=pass`, `dkim=pass`, `dmarc=pass`.
   - `Return-Path` belongs to the transactional subdomain.
   - `DKIM-Signature` uses the `mail.` subdomain.
4. Repeat with a large custom-question answer and a Slovak diacritics-heavy
   subject to confirm encoding and layout.
5. Record the date, accounts and results below.

A quick check of one message with the AWS CLI:

```sh
aws sesv2 send-email \
  --from-email-address "DebRIEF <no-reply@mail.debrief.sda.sk>" \
  --destination ToAddresses=you@gmail.com \
  --content '{"Simple":{"Subject":{"Data":"DebRIEF verification test"},"Body":{"Text":{"Data":"Test link: https://debrief.sda.sk"}}}}'
```

## Findings

The following items require access to the production DNS zone and SES console.
They are intentionally left as **pending** in this repository until verified.

| Check                                   | Status  | Notes |
| --------------------------------------- | ------- | ----- |
| Transactional subdomain selected        | pending |       |
| SPF record published and valid          | pending |       |
| Easy DKIM (2048-bit) enabled and valid  | pending |       |
| DMARC policy published and aligned      | pending |       |
| Custom MAIL FROM / Return-Path aligned  | pending |       |
| SES production access and config set    | pending |       |
| Test delivered to Gmail Inbox / Updates | pending |       |
