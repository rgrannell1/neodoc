# Parsing game plan

#### my_program.py -f FILE

Ambiguity, must parse bot as flag `-f` with value `FILE`
as well as flag `-f` and positional argument `FILE`.
Will be solved by parsed `Options`.

parse as:

```javascript
[ { type: 'flag',
  , name: '-f',
  , value: 'FILE'
  }
, { type: 'positional'
  , name: 'FILE'
  } ]
```

#### my_program.py -fFILE

Ambiguity, must parse both as stacked
`-f -F -I -L -E`, as well as `-f FILE`
Will be solved by parsed `Options`.

parse as:

```javascript
[ { type: 'flag'
  , name: '-f'
  , value: 'FILE'
  }
, { type: 'flag'
  , name: '-f'
  }
, { type: 'flag'
  , name: '-F'
  }
, { type: 'flag'
  , name: '-I'
  }
, { type: 'flag'
  , name: '-L'
  }
, { type: 'flag'
  , name: '-E'
  }
]
```
