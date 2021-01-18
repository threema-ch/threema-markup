# threema-markup

[![CI][ci-badge]][ci]

A markup parser and formatter for the markup language used in Threema.


## Usage

```typescript
import {markify} from '@threema/threema-markup';

const formatted = markify('*bold text with _italic_ *');
// Result: <span class="text-bold">bold text with <span class="text-italic">italic</span> </span>
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
