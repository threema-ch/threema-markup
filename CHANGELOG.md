# Changelog

This project follows semantic versioning.

Possible log types:

- `[added]` for new features.
- `[changed]` for changes in existing functionality.
- `[deprecated]` for once-stable features removed in upcoming releases.
- `[removed]` for deprecated features removed in this release.
- `[fixed]` for any bug fixes.
- `[security]` to invite users to upgrade in case of vulnerabilities.
- `[maintenance]` for maintenance work like dependency updates.


### v1.1.0 (2022-10-07)

- [changed] The `TokenType` type is now an enum, not a const enum. This means
  it can be used directly from non-TS consumers, and it works with the
  `isolatedModules` option as well.
- [deprecated] The constants `TOKEN_TYPE_ASTERISK`, `TOKEN_TYPE_UNDERSCORE` and
  `TOKEN_TYPE_TILDE` are deprecated. Use the `TokenType` attributes instead.
- [maintenance] Drop support for NodeJS 10 and 12 (should still work, but untested)
- [maintenance] Update test dependencies

### v1.0.0 (2021-01-19)

- [maintenance] Tag final 1.0.0 release

### v1.0.0-alpha.2 (2021-01-18)

- [added] Allow overriding CSS classes

### v1.0.0-alpha.1 (2021-01-18)

- [maintenance] Code extracted from threema-web, initial release on npm.
