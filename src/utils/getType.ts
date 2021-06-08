import { Type } from "psql-query-builder";

interface NumObj {
  [key: string]: number | undefined;
}

export const getType = (type: Type, { n, p, s }: NumObj): string => {
  const types = type.split("(");

  if (!types[1]) {
    return type;
  }

  if (types[1].includes("n")) {
    if (n === null || n === undefined) {
      throw new Error("Missing 'n' in 'createTable'");
    }
    types[1] = types[1].replace("n", String(n));
  }
  if (types[1].includes("p")) {
    if (p === null || p === undefined) {
      throw new Error("Missing 'p' in 'createTable'");
    }
    types[1] = types[1].replace("p", String(p));
  }
  if (types[1].includes("s")) {
    if (s === null || s === undefined) {
      throw new Error("Missing 's' in 'createTable'");
    }
    types[1] = types[1].replace("s", String(s));
  }

  return `${types.join("(")}`;
};
