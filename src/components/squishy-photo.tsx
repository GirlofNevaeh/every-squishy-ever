import { useState } from "react";
import { SquishyArt } from "@/components/squishy-art";
import type { Squishy } from "@/lib/catalog";

export function SquishyPhoto({
  item,
  alt = "",
  eager = false,
}: {
  item: Squishy;
  alt?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <SquishyArt imageKey={item.imageKey} colors={item.colors} label={item.name} />;
  }
  return (
    <img
      src={item.image}
      alt={alt}
      width={640}
      height={640}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className="h-full w-full bg-cream-deep object-cover"
      onError={() => setFailed(true)}
    />
  );
}
