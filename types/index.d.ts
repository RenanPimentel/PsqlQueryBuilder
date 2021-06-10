declare module "psql-query-builder" {
  import { Client, ClientConfig, QueryResult } from "pg";

  export interface PsqlResponse {
    queries: string[];
    query: string;
    args: any[];
  }

  export interface OptionObj {
    [key: string]: any;
  }

  export interface SelectOptionObj {
    [key: string]: { distinct?: boolean };
  }

  export interface InsertOptionObj {
    [key: string]: { value: any };
  }

  export interface FKeyOptions {
    tableKeyName: string;
    foreignKeyName: string;
    references: {
      table: string;
      tableKey: string;
    };
    onDelete?: "SET NULL" | "CASCADE";
  }

  export interface CreateOptionsObj {
    [key: string]: {
      type: Type;
      defaulValue?: string;
      nullable?: boolean;
      primaryKey?: boolean;
      foreignKey?: FKeyOptions;
      n?: number;
      p?: number;
      s?: number;
    };
  }

  export interface KeyIsValueObj {
    key: string;
    is: Condition;
    value: any;
  }

  export interface OrderOptionObj {
    [expression: string]: {
      order: "DESC" | "ASC";
    };
  }

  export class BasePsqlQueryBuilder {
    response: PsqlResponse;
    client: Client;

    static init(config?: Config): Promise<BasePsqlQueryBuilder>;
    send<T>(): Promise<QueryResult<T>>;
    raw(queryStr: string, args?: any[]): this;
    returning(returnOptions?: OptionObj | string[]): this;
    selectFrom(table: string, selectOption?: SelectOptionObj | string[]): this;
    insertInto(into: string, insertOption: InsertOptionObj): this;
    dropTable(table: string): this;
    createTable(table: string, createOptions: CreateOptionsObj): this;
    deleteFrom(table: string): this;
    where(whereOptions: KeyIsValueObj): this;
    and(andOptions: KeyIsValueObj): this;
    or(orOptions: KeyIsValueObj): this;
    orderBy(orderOptions: OrderOptionObj): this;
    using(table: string): this;
    clearQuery(): this;
    toString(): string;
  }

  export type Config = ClientConfig;

  export type Type =
    | "BIGINT"
    | "BIGSERIAL"
    | "BIT(n)"
    | "VARBIT(n)"
    | "BOOL"
    | "CHAR(n)"
    | "VARCHAR(n)"
    | "DATE"
    | "FLOAT8"
    | "INT"
    | "MONEY"
    | "DECIMAL(p, s)"
    | "FLOAT4"
    | "SMALLINT"
    | "SMALLSERIAL"
    | "SERIAL"
    | "TEXT"
    | "TIME"
    | "TIMETZ"
    | "TIMESTAMP"
    | "TIMESTAMPTZ";

  export type Condition =
    | ">"
    | "<"
    | "="
    | "<="
    | ">="
    | "!="
    | "AND"
    | "OR"
    | "<>"
    | "IN"
    | "NOT IN"
    | "BETWEEN"
    | "NOT BETWEEN"
    | "LIKE"
    | "NOT LIKE"
    | "IS NULL";
}
