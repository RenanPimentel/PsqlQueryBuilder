import { PsqlResponse } from "psql-query-builder";

export const getDefaultResponse = (): PsqlResponse => ({
  queries: [],
  args: [],
  get query() {
    return this.queries.join(" ");
  },
});
