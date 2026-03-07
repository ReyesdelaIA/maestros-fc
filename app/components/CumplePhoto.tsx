"use client";

import Image from "next/image";
import { useState } from "react";

export default function CumplePhoto({
  src,
  alt,
  sizes = "260px",
}: {
  src: string;
  alt: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center text-center text-xs text-zinc-400">
        Foto pendiente
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
