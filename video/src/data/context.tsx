import React, { createContext, useContext } from "react";
import type { Passage } from "../types";

const Ctx = createContext<Passage | null>(null);

export const DataProvider: React.FC<{ data: Passage; children: React.ReactNode }> = ({ data, children }) => (
  <Ctx.Provider value={data}>{children}</Ctx.Provider>
);

export const useData = (): Passage => {
  const d = useContext(Ctx);
  if (!d) throw new Error("useData must be used inside <DataProvider>");
  return d;
};
