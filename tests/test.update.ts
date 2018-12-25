import * as fs from "fs";
import * as path from "path";
import { PoTable } from "../src/podb";
import { Item } from "pofile";

const data = fs
  .readFileSync(path.resolve(__dirname, "fixtures/stats.po"))
  .toString();

function getTable(): PoTable {
  return new PoTable(data);
}

test("update plural", () => {
  const table = getTable();
  const countBefore = <number>(
    table.execute("select count(1) from t where msgstr0='yyy'")
  );
  expect(countBefore).toEqual(0);
  const countUpdated = <number>(
    table.execute("update t set msgstr0='yyy' where msgstr1='xxx'")
  );
  expect(countUpdated).toEqual(1);
  const items = <Item[]>table.execute("select * from t where msgstr0='yyy'");
  expect(items.length).toEqual(1);
});
