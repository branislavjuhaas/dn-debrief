# Security Policy

## Supported Versions

Security fixes are applied to the latest released version of the web platform and the production deployment. Older releases are not maintained; please make sure an issue still occurs on the latest release before reporting it.

## Reporting a Vulnerability

**Please do not report security vulnerabilities in public issues, pull requests, or discussions.**

To report a vulnerability:

1. **Preferred:** use GitHub's private vulnerability reporting on this repository — go to the **Security** tab and choose **Report a vulnerability**.
2. **Alternative:** email **[juhas.branislaw@gmail.com](mailto:juhas.branislaw@gmail.com)** with `SECURITY` in the subject line.

Please include as much of the following as you can:

- A description of the vulnerability and its impact.
- Steps to reproduce it (proof-of-concept, request/response examples, or screenshots).
- The affected route, page, or component, and the version or commit you tested.
- Any suggested fix or mitigation, if you have one.

## Scope

In scope:

- Authentication and session handling (Better-Auth).
- Authorization and role/permission checks.
- Payments and Stripe integration.
- File uploads and S3/RustFS storage access.
- The Nitro API and its OpenAPI surface.
- Exposure of personal data (users, legal guardians, registrations).

Out of scope:

- Vulnerabilities in third-party services or dependencies (please report those upstream; a short note is still welcome).
- Denial-of-service and volumetric attacks.
- Social engineering, phishing, or physical attacks.
- Reports produced solely by automated scanners without a demonstrated, exploitable impact.
- Testing against the production deployment with real user data. Use a local instance or your own test data.

## Our Commitment

We will review reports as promptly as we can, keep you informed about the progress, and credit you in the fix notes if you would like. Please give us a reasonable amount of time to investigate and release a fix before any public disclosure.

This project does not currently operate a bug bounty program.
