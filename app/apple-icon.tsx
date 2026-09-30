import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

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
          background: "linear-gradient(145deg, #1A1A1F 0%, #0A0A0B 100%)",
          borderRadius: "40px",
          border: "4px solid #26262B",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: "absolute",
            width: "120px",
            height: "60px",
            bottom: "30px",
            background: "radial-gradient(ellipse at center, rgba(255, 90, 31, 0.4) 0%, rgba(255, 90, 31, 0) 70%)",
          }}
        />

        {/* Display Frame */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "126px",
            height: "66px",
            backgroundColor: "#151518",
            border: "3px solid #26262B",
            borderRadius: "12px",
            position: "relative",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Inner Screen */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "112px",
              height: "52px",
              background: "linear-gradient(135deg, #FF7D45 0%, #FF5A1F 100%)",
              borderRadius: "8px",
              paddingLeft: "16px",
              position: "relative",
            }}
          >
            {/* Terminal prompt symbol */}
            <svg
              width="44"
              height="28"
              viewBox="0 0 44 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L14 14L4 22"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="20"
                y1="22"
                x2="38"
                y2="22"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Stand stem */}
        <div
          style={{
            width: "14px",
            height: "22px",
            backgroundColor: "#34343A",
          }}
        />

        {/* Stand base plate */}
        <div
          style={{
            width: "56px",
            height: "8px",
            backgroundColor: "#4A4A52",
            borderRadius: "4px",
          }}
        />

        {/* Desk line */}
        <div
          style={{
            width: "130px",
            height: "4px",
            backgroundColor: "#26262B",
            borderRadius: "2px",
            marginTop: "2px",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
