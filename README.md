## What is this ?
SQL interface for po(gettext) files.

## Motivation
Use po file as a database. Can be useful for cli tools, UI interfaces, also for fun.

## Supported SQL
```
SELECT
UPDATE
WHERE
AND
NOT
```

## Example
```
> const poDb = require('./podb').PoDb
undefined
> db = new poDb('.')
PoDb { path: '.' }
> db.execute("select * from stats where msgid='test' AND msgctxt")
[ { msgid: 'test',
    msgctxt: 'bla',
    references: 
     [ 'tests/fixtures/checkTest/check-trans-exist.js:2',
       'tests/fixtures/checkTest/check-trans-exist.js:3' ],
    msgid_plural: null,
    msgstr: [ '' ],
    comments: [],
    extractedComments: [],
    flags: {},
    obsolete: false,
    nplurals: 2 },
  { msgid: 'test',
    msgctxt: 'lala',
    references: [],
    msgid_plural: null,
    msgstr: [ '' ],
    comments: [],
    extractedComments: [],
    flags: {},
    obsolete: false,
    nplurals: 2 } ]
> 
```