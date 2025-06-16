/**
 * GET /api/version
 * Returns application metadata including version, author, and copyright.
 * Response is precomputed on module load for minimal per-request work.
 *
 */
const APP_VERSION = process.env.VERSION || "";
const versionResponse = {
  status: 200,
  body: {
    name: `   ///    |    DN DebRIEF v2 ${APP_VERSION} - DN Cascade Platform`,
    auth: `  / ///   |    (C) 2024 - 2025, Branislav Juhás`,
    note: ` / / /    |    Copyrighted member of the DN Family`,
    rest: "/",
  },
};

export default defineEventHandler(() => versionResponse);
