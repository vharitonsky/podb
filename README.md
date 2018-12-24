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
COUNT
LIKE
```

## Available columns

`msgid, msgstr, msgctxt, msgid_plural`

## Examples

#### As database:
```js
import {PoDb} from 'podb';
const db = new PoDb('.'); // open current directory as db
const messages = db.execute("select count(1) from catalog") // catalog is a table points to catalog.po in './'
console.log(messages); // 42
```
### As table:

```js
import * as fs from 'fs'
import {PoTable} from 'podb';
const table = new PoTable(fs.readFileSync('catalog.po').toString()); // open in memory data as a table
// table is irrelevant in select clauses except 'table' is a reserved word
table.execute("select * from t where not msgstr")); // get all untranslated records
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

## Cudos

[rubenv](https://github.com/rubenv) for excelent [pofile](https://github.com/) library.
