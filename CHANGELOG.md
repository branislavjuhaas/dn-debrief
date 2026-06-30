# Changelog

## v2.26.0-alpha.2

[compare changes](https://github.com/branislavjuhaas/dn-debrief/compare/v2.26.0-alpha.1...v2.26.0-alpha.2)

### 🩹 Fixes

- **web:** Correct the dockerfile to build properly ([28f0df1](https://github.com/branislavjuhaas/dn-debrief/commit/28f0df1))
- **web:** Do not require legal guardian for adult users ([b1c5dc8](https://github.com/branislavjuhaas/dn-debrief/commit/b1c5dc8))
- **infrastructure:** Minify docker container size by not bundling node_modules ([724a62d](https://github.com/branislavjuhaas/dn-debrief/commit/724a62d))

### ❤️ Contributors

- Branislav Juhás ([@branislavjuhaas](https://github.com/branislavjuhaas))

## v2.26.0-alpha.1

[compare changes](https://github.com/branislavjuhaas/dn-debrief/compare/v25.2.1...v2.26.0-alpha.1)

### 🚨 Breaking changes

- **infrastructure:** Migrate main web platform from vue to nuxt
- **infrastructure:** Implement nuxt/ui instead of custom interface implementation
- **infrastructure:** Defined custom server using nitro in nuxt instead of relying on firebase with:
  - _better-auth_ for authentication
  - _postgres_ for the database
  - _drizzle_ for the database management
  - _minio_ for the storage

### 📃 Licensing

- **license:** Release project under the _AGPL_ license

### 🤝 Value-based decisions

- **project:** Rename project to _dn-debrief_ internally and in public-facing sections

### ❤️ Contributors

- Branislav Juhás ([@branislavjuhaas](https://github.com/branislavjuhaas))
