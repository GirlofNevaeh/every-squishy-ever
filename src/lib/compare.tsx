import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type CompareValue = {
  ids: string[];
  full: boolean;
  toggle: (id: string) => void;
  clear: () => void;
};

const CompareContext = createContext<CompareValue | null>(null);
const STORAGE_KEY = "squish-compare";

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [full, setFull] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      if (Array.isArray(parsed)) {
        setIds(parsed.filter((id): id is string => typeof id === "string").slice(0, 3));
      }
    } catch {
      setIds([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids, ready]);

  function toggle(id: string) {
    setIds((current) => {
      if (current.includes(id)) {
        setFull(false);
        return current.filter((item) => item !== id);
      }
      if (current.length >= 3) {
        setFull(true);
        return current;
      }
      setFull(false);
      return [...current, id];
    });
  }

  function clear() {
    setFull(false);
    setIds([]);
  }

  return <CompareContext.Provider value={{ ids, full, toggle, clear }}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const value = useContext(CompareContext);
  if (!value) throw new Error("Compare is missing");
  return value;
}
