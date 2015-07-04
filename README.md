# Docopt.js

> Pure javascript implementation of docopt

:construction: ...work in progress... :construction:

Pure javascript implementation of the docopt language with a fresh and
functional approach to things, using [bennu-js][bennu] for
parsing and a fairly exhaustive test suite for asserting functionality and
parsers.

## Design

For the better of for the worse, the approach of this implementation is fairly
different from the ususal approach of essentially rewriting the original python
implementation in the target language:

1. Parse input into `meta` space
    1. Parse usage lines
    2. Parse option blocks
2. Resolve ambiguities: `meta` -> `meta'`
3. Generate a parser from `meta'` specification
4. Apply parser to input

## Todo

* Resolve ambiguities: `meta` -> `meta'`
* Generate parser from `meta'`
* Apply parser to input

## Wishlist

* Render parse errors for developers
* Persist `meta'` to disk as JSON to speed things up (maybe)

[bennu]: http://bennu-js.com/
