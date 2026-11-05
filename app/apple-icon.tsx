import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS home-screen icon. Apple does not accept SVG touch icons, so the
 * monochrome fraction mark is rendered to PNG at build time.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          background: "#000000",
        }}
      >
        <div style={{ width: 26, height: 26, borderRadius: 13, background: "#ffffff" }} />
        <div style={{ width: 80, height: 12, borderRadius: 6, background: "#ffffff" }} />
        <div style={{ width: 26, height: 26, borderRadius: 13, background: "#ffffff" }} />
      </div>
    ),
    { ...size }
  );
}

