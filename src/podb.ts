import * as fs from 'fs';
import { find } from './finder';
import { Item, parse } from 'pofile';
import { parseSql, WhereClause, WhereType, OperatorType, ColumnRef, SetValue, QueryType, ParsedStatement } from './sqlparser';

const AVAILABLE_COLUMNS = ["msgid", "msgstr", "msgctxt", "msgid_plural"]
const AVAILABLE_COLUMNS_EXCEPTION = `Available columns: ${AVAILABLE_COLUMNS.join(', ')}`

export class PoDb {
    path: string;

    constructor(path: string) {
        this.path = path
    }

    _match(item: Item, where: WhereClause|ColumnRef): boolean {
        if (where.type == WhereType.COLUMN) {
            const condition = <ColumnRef>where;
            if (AVAILABLE_COLUMNS.indexOf(condition.column) == -1) {
                throw(AVAILABLE_COLUMNS_EXCEPTION);
            }
            if (condition.column == 'msgid') return !!item.msgid
            if (condition.column == 'msgstr') return !!item.msgstr[0]
            if (condition.column == 'msgctxt') return !!item.msgctxt
            if (condition.column == 'msgid_plural') return !!item.msgid_plural
        } else {
            where = <WhereClause>where;
            if (where.operator == OperatorType.EQUAL){
                const condition = <ColumnRef>where.left;
                const value = (<ColumnRef>where.right).value;
                if (condition.column == 'msgid') {
                    return item.msgid == value;
                }else if (condition.column == 'msgstr'){
                    return item.msgstr[0] == value;
                }else if (condition.column == 'msgctxt') {
                    return (item.msgctxt || '') == value;
                }else {
                    throw(AVAILABLE_COLUMNS_EXCEPTION)
                }
            } else if (where.operator == OperatorType.AND) {
                return this._match(item, <WhereClause>where.left) && this._match(item, <WhereClause>where.right);
            } else if (where.operator == OperatorType.NOT) {
                return !this._match(item, <WhereClause>where.expr);
            }
        }
        return false;
    }

    _set(item: Item, setValues: Array<SetValue>) {
        for (const setValue of setValues) {
            switch (setValue.column){
                case 'msgid': {
                    item.msgid = setValue.value.value;
                    continue
                }
                case 'msgstr': {
                    item.msgstr = [setValue.value.value];
                }
                case 'msgctxt': {
                    item.msgctxt = setValue.value.value;
                }
            }
        }
    }
    
    _select(items: Array<Item>, where: WhereClause) {
        const result = [];
        for (const item of items){
            if (this._match(item, where)) {
                result.push(item);
            }
        }
        return result;
    }

    _update(items: Array<Item>, where: WhereClause, setValues: Array<SetValue>, filename: string, data: string): number {
        let updatedCount = 0
        for (const item of items){
            if (this._match(item, where)) {
                const msgid = item.msgid;
                const msgctxt = item.msgctxt || "";
                this._set(item, setValues);
                const [start, finish] = find(data, msgid, msgctxt);
                data = data.split('\n').slice(0, start - 1).concat([item.toString(), '']).concat(data.split('\n').slice(finish)).join('\n');
                updatedCount += 1;
            }
        }
        console.log(data)
        return updatedCount;
    }

    _getFilename(sql: ParsedStatement) {
        switch (sql.type) {
            case QueryType.SELECT: return sql.from[0].table
            case QueryType.UPDATE: return sql.table
            default: throw("Only selects and updates are supported")
        }
    }

    execute(statement: string): number|Array<Item> {
        const sql = parseSql(statement);
        const filename = this._getFilename(sql)
        let data = fs.readFileSync(`${this.path}/${filename}.po`).toString();
        const po = parse(data);

        switch (sql.type) {
            case QueryType.SELECT: {
                return this._select(po.items, sql.where);
            }
            case QueryType.UPDATE: {
                return this._update(po.items, sql.where, sql.set, filename, data);
            }
            default:
                throw("Only selects and updates are supported")
        }
    }
}
