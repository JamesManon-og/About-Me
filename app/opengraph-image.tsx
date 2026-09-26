import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

/** The share image: the chat's own look, near-black with one question. */

export const alt = `${SITE.name}: ask about his work`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#212121",
        color: "#ececec",
      }}
    >
      <div style={{ fontSize: 34, color: "#b4b4b4" }}>{SITE.name}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ fontSize: 76, lineHeight: 1.1 }}>
          What do you want to know about James?
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 84,
            padding: "0 36px",
            borderRadius: 42,
            background: "#303030",
            color: "#8f8f8f",
            fontSize: 32,
          }}
        >
          Ask anything about James
        </div>
      </div>
      <div style={{ fontSize: 28, color: "#b4b4b4" }}>
        Full-stack developer · Davao City, Philippines
      </div>
    </div>,
    size,
  );
}
