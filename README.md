# Parsing game plan

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
