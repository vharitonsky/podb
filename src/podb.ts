import * as fs from "fs";
import { find } from "./finder";
import { Item, parse, PO } from "pofile";
import { regExpFromString } from "./util";
import {
  parseSql,
  isComparison,
  WhereClause,
  WhereType,
  OperatorType,
  ColumnRef,
  SetValue,
  QueryType,
  ParsedStatement
} from "./sqlparser";
import { isArray } from "util";

const AVAILABLE_COLUMNS = ["msgid", "msgstr", "msgctxt", "msgid_plural"];
const AVAILABLE_COLUMNS_EXCEPTION = `Available columns: ${AVAILABLE_COLUMNS.join(
  ", "
)}`;

export class PoTable {
  po: PO;
  private rawData: string;

  constructor(tableData: string) {
    this.rawData = tableData;
    this.po = parse(tableData);
  }

  private test(
    operator: OperatorType,
    left: string,
    right: string | RegExp
  ): boolean {
    if (operator == OperatorType.EQUAL) {
      return left == right;
    } else if (operator == OperatorType.LIKE) {
      return (<RegExp>right).test(left);
    } else {
      return false;
    }
  }

  private getValue(operator: OperatorType, rawValue: string): string | RegExp {
    if (operator == OperatorType.LIKE) {
      return regExpFromString(rawValue);
    } else {
      return rawValue;
    }
  }

  private match(item: Item, where: WhereClause | ColumnRef): boolean {
    if (!where) {
      return true;
    } else if (where.type == WhereType.COLUMN) {
      const condition = <ColumnRef>where;
      if (AVAILABLE_COLUMNS.indexOf(condition.column) == -1) {
        throw AVAILABLE_COLUMNS_EXCEPTION;
      }
      if (condition.column == "msgid") return !!item.msgid;
      if (condition.column == "msgstr")
        return !!item.msgstr.reduce((acc, b) => acc + b);
      if (condition.column == "msgctxt") return !!item.msgctxt;
      if (condition.column == "msgid_plural") return !!item.msgid_plural;
    } else {
      where = <WhereClause>where;
      if (isComparison(where.operator)) {
        const condition = <ColumnRef>where.left;
        const value = this.getValue(
          where.operator,
          (<ColumnRef>where.right).value
        );
        if (condition.column == "msgid") {
          return this.test(where.operator, item.msgid, value);
        } else if (condition.column == "msgid_plural") {
          return this.test(where.operator, item.msgid_plural || "", value);
        } else if (condition.column == "msgstr") {
          for (const msg of item.msgstr) {
            if (this.test(where.operator, msg, value)) {
              return true;
            }
            return false;
          }
        } else if (condition.column == "msgctxt") {
          return this.test(where.operator, item.msgctxt || "", value);
        } else {
          throw AVAILABLE_COLUMNS_EXCEPTION;
        }
      } else if (where.operator == OperatorType.AND) {
        return (
          this.match(item, <WhereClause>where.left) &&
          this.match(item, <WhereClause>where.right)
        );
      } else if (where.operator == OperatorType.OR) {
        return (
          this.match(item, <WhereClause>where.left) ||
          this.match(item, <WhereClause>where.right)
        );
      } else if (where.operator == OperatorType.NOT) {
        return !this.match(item, <WhereClause>where.expr);
      }
    }
    return false;
  }

  private set(item: Item, setValues: Array<SetValue>) {
    for (const setValue of setValues) {
      switch (setValue.column) {
        case "msgid": {
          item.msgid = setValue.value.value;
          continue;
        }
        case "msgstr": {
          item.msgstr = [setValue.value.value];
        }
        case "msgctxt": {
          item.msgctxt = setValue.value.value;
        }
      }
    }
  }

  private select(items: Array<Item>, where: WhereClause) {
    return items.filter(item => this.match(item, where));
  }

  private count(items: Array<Item>, where: WhereClause) {
    return items.reduce(
      (acc, item) => acc + (this.match(item, where) ? 1 : 0),
      0
    );
  }

  private update(
    items: Array<Item>,
    where: WhereClause,
    setValues: Array<SetValue>
  ): number {
    let updatedCount = 0;
    for (const item of items) {
      if (this.match(item, where)) {
        const msgid = item.msgid;
        const msgctxt = item.msgctxt || "";
        this.set(item, setValues);
        const [start, finish] = find(this.rawData, msgid, msgctxt);
        const splitData = this.rawData.split("\n");
        this.rawData = splitData
          .slice(0, start - 1)
          .concat([item.toString(), ""])
          .concat(splitData.slice(finish))
          .join("\n");
        updatedCount += 1;
      }
    }
    this.po = parse(this.rawData);
    return updatedCount;
  }

  execute(statement: string): number | Array<Item> {
    const sql = parseSql(statement);
    switch (sql.type) {
      case QueryType.SELECT: {
        if (
          isArray(sql.columns) &&
          sql.columns[0].expr.type == "function" &&
          sql.columns[0].expr.name == "count"
        ) {
          return this.count(this.po.items, sql.where);
        } else {
          return this.select(this.po.items, sql.where);
        }
      }
      case QueryType.UPDATE: {
        return this.update(this.po.items, sql.where, sql.set);
      }
      default:
        throw "Only selects and updates are supported";
    }
  }

  getTableData() {
    return this.rawData;
  }
}

export class PoDb {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  private getFilename(sql: ParsedStatement) {
    switch (sql.type) {
      case QueryType.SELECT:
        return sql.from[0].table;
      case QueryType.UPDATE:
        return sql.table;
      default:
        throw "Only selects and updates are supported";
    }
  }

  execute(statement: string, sync: Boolean): number | Array<Item> {
    const sql = parseSql(statement);
    const filename = this.getFilename(sql);
    const path = `${this.path}/${filename}.po`;
    let data = fs.readFileSync(path).toString();
    const poTable = new PoTable(data);
    const result = poTable.execute(statement);
    if (sync) {
      fs.writeFileSync(path, poTable.getTableData());
    }
    return result;
  }
}
