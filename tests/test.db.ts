import * as fs from "fs";
import * as path from "path";
import { PoDb } from "../src/podb";

const dbPath = path.resolve(__dirname, "fixtures/");

test("open db", () => {
  const db = new PoDb(dbPath);
  expect(db.getTable("stats").getHeaders()).toMatchSnapshot();
});
