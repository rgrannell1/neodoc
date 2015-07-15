# Docopt.js

> Pure javascript implementation of docopt

:construction: ...work in progress... :construction:

Pure javascript implementation of the docopt language with a fresh and
functional approach to things, using [bennu-js][bennu] for parsing and
a fairly exhaustive test suite for asserting functionality and parsers.

## Design

For better or for worse, the approach of this implementation is fairly different
from the ususal approach of essentially rewriting the original python
implementation in the target language:

1. Parse many `Option` Block(s)
1. Parse 1 or more `Usage` Block(s)
1. Resolve ambiguities: `(Usage : Usage[]) -> (Option[]) -> Meta'`
1. Generate a parser from `Meta'` specification: `Meta' -> Parser`
1. Apply parser to input: `Parser -> Input -> Either Error Args`

Because each step is fairly discrete, testing each bit becomes more easily
achievable. The tests assume more and more known-to-be-working code the further
down the pipeline it goes.

## Note-worthy augmentations

* `Options` must line up on the leading flag and the start of the description.
  This is ought to enforce clean help messages. _Maybe this could be exposed
  as a compile flag `pendantic` later. There are more parts of docopt that
  could use a `pedantic` compile flag to enforce "beautiful", and more importantly
  consistent help messages_.
* `Options` leading flags must either not specifiy arguments, only specify an
  argument on _either_ the long or the short version or specify the _same_
  argument for both the short and the long version of the flag.

## Todo

* Apply parser to input: `Parser -> Input -> Either Error Args`

## Wishlist

* Render parse errors for developers
* Persist `Meta'` to disk as JSON to speed things up (maybe)

[bennu]: http://bennu-js.com/
