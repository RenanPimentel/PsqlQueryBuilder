import { Client, QueryResult } from "pg";
import {
  BasePsqlQueryBuilder,
  Config,
  CreateOptionsObj,
  InsertOptionObj,
  OptionObj,
  OrderOptionObj,
  SelectOptionObj,
  KeyIsValueObj,
} from "psql-query-builder";
import "../typings/index";
import { getDefaultResponse } from "./constants";
import { getType } from "./utils/getType";

export class PsqlQueryBuilder implements BasePsqlQueryBuilder {
  public client: Client;
  public response = getDefaultResponse();

  private constructor(config?: Config) {
    this.client = new Client(config);
  }

  static async init(config?: Config): Promise<PsqlQueryBuilder> {
    const qBuilder = new PsqlQueryBuilder(config);
    await qBuilder.client.connect();
    return qBuilder;
  }

  async send<T>(): Promise<QueryResult<T>> {
    const { args, query } = this.response;

    const dbResponse = await this.client.query<T>(query, args);
    this.clearQuery();
    return dbResponse;
  }

  raw(queryStr: string, args: any[] = []): this {
    this.response.queries.push(queryStr);
    this.response.args.push(...args);
    return this;
  }

  returning(returnOptions?: OptionObj | string[]): this {
    const returnArr = ["RETURNING"];

    if (!returnOptions) {
      returnArr.push("*");
    } else if (Array.isArray(returnOptions)) {
      returnArr.push(`( ${returnOptions.join(", ")} )`);
    } else {
      returnArr.push(`( ${Object.keys(returnOptions).join(", ")} )`);
    }

    this.response.queries.push(returnArr.join(" "));

    return this;
  }

  selectFrom(table: string, selectOption?: SelectOptionObj | string[]): this {
    const selectArr = ["SELECT"];

    if (!selectOption) {
      selectArr.push("*");
    } else if (Array.isArray(selectOption)) {
      selectArr.push(`${selectOption.join(", ")}`);
    } else {
      selectArr.push(
        Object.entries(selectOption)
          .map(([key, { distinct }]) => (distinct ? `DISTINCT ${key}` : key))
          .join(", ")
      );
    }

    selectArr.push(`FROM ${table}`);

    this.response.queries.push(selectArr.join(" "));

    return this;
  }

  insertInto(table: string, insertOption: InsertOptionObj): this {
    const insertArr = [`INSERT INTO ${table}`];

    insertArr.push("(");

    const keys = Object.keys(insertOption);
    insertArr.push(keys.join(", "));

    insertArr.push(") VALUES (");

    const valuesForInsertArr = Object.values(insertOption).map(({ value }) => {
      this.response.args.push(value);
      return `$${this.response.args.length}`;
    });

    insertArr.push(valuesForInsertArr.join(", "));
    insertArr.push(")");

    this.response.queries.push(insertArr.join(" "));

    return this;
  }

  dropTable(table: string): this {
    const query = `DROP TABLE IF EXISTS ${table}`;
    this.response.queries.push(query);

    return this;
  }

  createTable(table: string, createOptions: CreateOptionsObj): this {
    const createArr = [`CREATE TABLE IF NOT EXISTS ${table} (`];
    const optionsEntries = Object.entries(createOptions);

    for (const index in optionsEntries) {
      const [key, value] = optionsEntries[index];
      const { type, defaulValue, primaryKey, nullable, n, p, s } = value;
      const entryArr = [key, getType(type, { n, p, s })];

      if (nullable !== true) {
        entryArr.push("NOT NULL");
      }
      if (defaulValue !== null && defaulValue !== undefined) {
        entryArr.push(`DEFAULT ${defaulValue}`);
      }
      if (primaryKey) {
        entryArr.push(`PRIMARY KEY`);
      }

      createArr.push(entryArr.join(" "));
    }
    createArr.push(")");

    this.response.queries.push(
      createArr.join(", ").replace("(,", "(").replace(", )", " )")
    );
    return this;
  }

  deleteFrom(table: string): this {
    const query = `DELETE FROM ${table}`;
    this.response.queries.push(query);
    return this;
  }

  where({ key, is, value }: KeyIsValueObj): this {
    this.response.args.push(value);
    const query = `WHERE ${key} ${is} $${this.response.args.length}`;
    this.response.queries.push(query);
    return this;
  }

  and({ key, is, value }: KeyIsValueObj): this {
    this.response.args.push(value);
    const query = `AND ${key} ${is} $${this.response.args.length}`;
    this.response.queries.push(query);
    return this;
  }

  or({ key, is, value }: KeyIsValueObj): this {
    this.response.args.push(value);
    const query = `OR ${key} ${is} $${this.response.args.length}`;
    this.response.queries.push(query);
    return this;
  }

  orderBy(orderOptions: OrderOptionObj): this {
    const orderArr = ["ORDER BY"];

    const entries = Object.entries(orderOptions).map(
      ([expression, { order }]) => `${expression} ${order}`
    );

    orderArr.push(entries.join(", "));

    this.response.queries.push(orderArr.join(" "));
    return this;
  }

  clearQuery(): this {
    this.response = getDefaultResponse();
    return this;
  }

  toString() {
    return this.response.query;
  }
}
