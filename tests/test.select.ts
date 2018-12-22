import * as fs from "fs";
import * as path from "path";
import { PoTable } from "../src/podb";

test("select * from table", () => {
  const data = fs
    .readFileSync(path.resolve(__dirname, "fixtures/stats.po"))
    .toString();
  const table = new PoTable(data);
  expect(table.execute("select * from t where msgid")).toMatchSnapshot();
});
