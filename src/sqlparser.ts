import { Parser } from "flora-sql-parser";

const p = new Parser();

export enum QueryType {
  SELECT = "select",
  UPDATE = "update"
}

export enum OperatorType {
  AND = "AND",
  NOT = "NOT",
  EQUAL = "=",
  LIKE = "LIKE",
  ILIKE = "ILIKE",
  OR = "OR"
}

export enum WhereType {
  UNARY = "unary_expr",
  COLUMN = "column_ref",
  BINARY = "binary_expr"
}

export type FromClause = {
  table: string;
};

export type ColumnRef = {
  column: string;
  value: string;
  type: string;
  table?: string;
  name: string;
};

export type WhereClause = {
  operator: OperatorType;
  left: ColumnRef | WhereClause;
  right: ColumnRef | WhereClause;
  expr: WhereClause | ColumnRef;
  type: string;
};

export type Expression = {
  expr: ColumnRef;
};

export type SetValue = {
  column: string;
  value: { type: string; value: string };
};

export type ParsedStatement = {
  type: string;
  where: WhereClause;
  from: Array<FromClause>;
  columns: Array<Expression>;
  set: Array<SetValue>;
  table: string;
  limit: [{ type: string; value: number }, { type: string; value: number }];
};

export function parseSql(statement: string): ParsedStatement {
  return p.parse(statement);
}

export function isComparison(operator: OperatorType) {
  return (
    operator == OperatorType.EQUAL ||
    operator == OperatorType.LIKE ||
    operator == OperatorType.ILIKE
  );
}
