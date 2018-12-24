## What is this ?
SQL interface for po(gettext) files.

## Motivation
Use po file as a database. Can be useful for cli tools, UI interfaces, data exploration, also for fun.

## Supported SQL
```
SELECT
UPDATE
WHERE
AND
OR
NOT
COUNT
LIKE
```

## Available columns

`msgid, msgstr, msgctxt, msgid_plural`

## Examples

#### As database:
```js
import {PoDb} from 'podb';
// open current directory as db
const db = new PoDb('.'); 
 // catalog is a table points to catalog.po in './'
const messages = db.execute("select count(1) from catalog")
console.log(messages); // 42
```
### As table:

```js
import * as fs from 'fs'
import {PoTable} from 'podb';
// open in memory data as a table
const table = new PoTable(fs.readFileSync('catalog.po').toString()); 
// table name is irrelevant in select clauses except 'table' is a reserved word
// get all untranslated records
table.execute("select * from t where not msgstr")); 
// [{ msgid: ' в категории %s',
//     msgctxt: null,
//     references: [ 'myproj/lib/title.py:959' ],
//     msgid_plural: null,
//     msgstr: [ '' ],
//     comments: [],
//     extractedComments: [],
//     flags: { 'python-format': true },
//     obsolete: false,
//     nplurals: 3 },
//  ....
//]
```

### Compound statements

```js
// get all untranslated plural strings
table.execute("select * from t where msgid_plural and not msgstr")); 
```

### LIKE

```js
table.execute("select * from t where msgstr like 'пошук'")
// [ { msgid: ' Продажа, поиск, поставщики и магазины, все цены',
//     msgctxt: null,
//     references: [ 'myproj/lib/title.py:1014' ],
//     msgid_plural: null,
//     msgstr: [ ' Продаж, пошук, постачальники та магазини, всі ціни' ],
//     comments: [],
//     extractedComments: [],
//     flags: {},
//     obsolete: false,
//     nplurals: 3 },
```

### Advanced LIKE for case insensitive search

```js
table.execute("select * from t where msgstr like '/продаж/i'")
// [ { msgid: ' Продажа, поиск, поставщики и магазины, все цены',
//     msgctxt: null,
//     references: [ 'myproj/lib/title.py:1014' ],
//     msgid_plural: null,
//     msgstr: [ ' Продаж, пошук, постачальники та магазини, всі ціни' ],
//     comments: [],
//     extractedComments: [],
//     flags: {},
//     obsolete: false,
//     nplurals: 3 },
```

### UPDATE

```js
table.getTableData()
// msgid ""
// msgstr ""
// "Content-Type: text/plain; charset=utf-8\n"
// "Plural-Forms: nplurals=2; plural=(n!=1);\n"

// #: tests/fixtures/checkTest/check-trans-exist.js:2
// #: tests/fixtures/checkTest/check-trans-exist.js:3
// msgid "test"
// msgstr ""

table.execute("update simple set msgstr='value' where msgid='test'"); // 1
table.getTableData();

// msgid ""
// msgstr ""
// "Content-Type: text/plain; charset=utf-8\n"
// "Plural-Forms: nplurals=2; plural=(n!=1);\n"

// #: tests/fixtures/checkTest/check-trans-exist.js:2
// #: tests/fixtures/checkTest/check-trans-exist.js:3
// msgid "test"
// msgstr "value"
```

#### Or as db

```js
 // sync to file
db.execute("update simple set msgstr='value' where msgid='test'", true);
```

## Plans

- plural select/update - msgstr{index}
- reference search
- handy functions(LOWER, UPPER)
- IN operator
- ORDER operator


## Cudos

[rubenv](https://github.com/rubenv) for excelent [pofile](https://github.com/) library.

[godmodelabs](https://github.com/godmodelabs) for handy [flora-sql-parser](https://github.com/godmodelabs/flora-sql-parser)
