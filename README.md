# threema-markup

[![CI][ci-badge]][ci]

A markup parser and formatter for the markup language used in Threema.


## Usage

The simplest way is to apply the `markify` function to text with markup.

```typescript
import {markify} from '@threema/threema-markup';

const formatted = markify('*bold text with _italic_ *');
// Result: <span class="text-bold">bold text with <span class="text-italic">italic</span> </span>
```

By default, the following CSS class mapping is used:

- Bold: `text-bold`
- Italic: `text-italic`
- Strikethrough: `text-strike`

But this can be customized:

```typescript
import {TokenType, markify} from '@threema/threema-markup';

const formatted = markify('*bold text with _italic_ *', {
    [TokenType.Asterisk]: 'a',
    [TokenType.Underscore]: 'u',
    [TokenType.Tilde]: 't',
});
// Result: <span class="a">bold text with <span class="u">italic</span> </span>
```


## Development

### Setup

    npm install

## Building

    npm run build

## Testing

    npm test


## License

Licensed under either of

 * Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or
   http://www.apache.org/licenses/LICENSE-2.0)
 * MIT license ([LICENSE-MIT](LICENSE-MIT) or
   http://opensource.org/licenses/MIT)

at your option.

<!-- Badges -->
[ci]: https://github.com/threema-ch/threema-markup/actions?query=workflow%3ACI
[ci-badge]: https://img.shields.io/github/workflow/status/threema-ch/threema-markup/CI/main
