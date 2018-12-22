import { Parser } from "flora-sql-parser";

const p = new Parser();

export enum QueryType {
  SELECT = "select",
  UPDATE = "update"
}

export enum OperatorType {
  AND = "AND",
  NOT = "NOT",
  EQUAL = "="
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
};

export function parseSql(statement: string): ParsedStatement {
  return p.parse(statement);
}

// > ss = p.parse('SELECT * FROM t where msgstr="ddsa"');
// { with: null,
//   type: 'select',
//   options: null,
//   distinct: null,
//   columns: '*',
//   from: [ { db: null, table: 't', as: null } ],
//   where:
//    { type: 'binary_expr',
//      operator: '=',
//      left: { type: 'column_ref', table: null, column: 'msgstr' },
//      right: { type: 'column_ref', table: null, column: 'ddsa' } },
//   groupby: null,
//   having: null,
//   orderby: null,
//   limit: null }
// > ss.where
// { type: 'binary_expr',
//   operator: '=',
//   left: { type: 'column_ref', table: null, column: 'msgstr' },
//   right: { type: 'column_ref', table: null, column: 'ddsa' } }
