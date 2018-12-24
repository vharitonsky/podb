import * as fs from "fs";
import * as path from "path";
import { PoTable } from "../src/podb";
import { Item } from "pofile";

const data = fs
  .readFileSync(path.resolve(__dirname, "fixtures/stats.po"))
  .toString();
const table = new PoTable(data);

test("select * from table", () => {
  expect(table.execute("select * from t where msgid")).toMatchSnapshot();
});

test("select * from table where not msgstr", () => {
  const result = <Item[]>table.execute("select * from t where not msgstr");
  expect(result.length).toEqual(4);
});

test("select * from table like", () => {
  const items = <Item[]>(
    table.execute(
      "select * from t where msgctxt='lala' and msgid like '^.+_regexp$'"
    )
  );
  expect(items.length).toEqual(1);
  expect(items[0].msgid).toEqual("test_regexp");
});

test("select * from table ilike", () => {
  const items = <Item[]>(
    table.execute(
      "select * from t where msgctxt='lala' and msgid like '/testupper/i'"
    )
  );
  expect(items.length).toEqual(1);
  expect(items[0].msgid).toEqual("TESTUPPER");
});

test("select count(1) from table", () => {
  const count = <number>table.execute("select count(1) from t");
  expect(count).toEqual(6);
});

test("select or", () => {
  const count = <number>(
    table.execute("select count(1) from t where not msgctxt or msgctxt='bla'")
  );
  expect(count).toEqual(4);
});

test("select plural", () => {
  const count = <number>(
    table.execute("select count(1) from t where msgstr1='xxx'")
  );
  expect(count).toEqual(1);
});
