import { readAccess } from "@/lib/access/gate";

const LOCKED = "This page stays locked until you enter an access key.";

export async function gateMeta(title: string, description: string) {
  if (await readAccess()) {
    return {
      meta: [
        { title },
        { name: "description", content: description },
      ],
    };
  }
  return {
    meta: [
      { title: "Every Squishy Ever" },
      { name: "description", content: LOCKED },
    ],
  };
}
