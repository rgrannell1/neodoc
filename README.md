# Parsing game plan

1. The usage parser parses usage lines into an intermediate format:

```javascript
{ program: '<name>'
, usage: [ <usage-line> ]
}
```

where `<usage-line>` is a list of arguments:

```
// -fFILE -f FILE
[
    { type: 'MERGED_FLAGS'
    , chars: 'fFILE'
    }
  , { type: 'FLAG_SHORT'
    , char: 'f'
    }
  , { type: 'POSITIONAL'
    , name: 'FILE'
    }
]
```

This intermediate format MAY contain ambiguity in it's arguments
which MUST be resolved for a successful parse. Ambiguity is
resolved based on the arguments' positions and it is thus important
to not change the order of elements in the array.

2. The options parser parses options into an intermediate format:

```
... TODO
```

3. Ambigiuos matches are resolved
4. A parser is generated for each usage line, and a super-parser
   houses each parser in a trie.

#### my_program.py -f FILE

Ambiguity, must parse bot as flag `-f` with value `FILE`
as well as flag `-f` and positional argument `FILE`.
Will be solved by parsed `Options`.

parse as:

```javascript
[ { type: 'FLAG'
  , name: '-f'
  , value: 'FILE'
  , ambiguity: 'POSITIONAL'
  }
]
```

#### my_program.py -fFILE

Ambiguity, must parse both as stacked
`-f -F -I -L -E`, as well as `-f FILE`
Will be solved by parsed `Options`.

Assume `-fFILE` means `-f` with value
`FILE`, even though the docopt specs
default to the opposite.

parse as:

```javascript
[ { type: 'FLAG'
  , name: '-f'
  , value: 'FILE'
  , ambiguity: 'MERGED_FLAGS'
  }
]
```
