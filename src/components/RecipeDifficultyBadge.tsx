import React from "react";

export interface RecipeDifficultyBadgeProps {
  difficulty: string;
  variant?: "badge" | "gauge" | "full";
  size?: "sm" | "md" | "lg";
}

export const RecipeDifficultyBadge: React.FC<RecipeDifficultyBadgeProps> = ({
  difficulty = "Easy",
  variant = "badge",
  size = "sm"
}) => {
  const norm = (difficulty || "Easy").toLowerCase().trim();

  let level = 1; // 1 to 4
  let label = "Easy";
  let color = "#16A34A"; // green
  let bg = "#DCFCE7";
  let border = "#A7F3D0";
  let icon = "🟢";
  let meter = [true, false, false, false];
  let skillDesc = "Basic chopping & simple heat control. Great for quick meals.";

  if (norm.includes("michelin") || norm.includes("master") || norm.includes("expert") || norm.includes("pro")) {
    level = 4;
    label = "Michelin Level";
    color = "#7C3AED"; // purple
    bg = "#F3E8FF";
    border = "#DDD6FE";
    icon = "👑";
    meter = [true, true, true, true];
    skillDesc = "Advanced technique, precision timing & fine knife mastery required.";
  } else if (norm.includes("hard") || norm.includes("advanced") || norm.includes("complex")) {
    level = 3;
    label = "Hard";
    color = "#DC2626"; // red
    bg = "#FEE2E2";
    border = "#FECACA";
    icon = "🔥";
    meter = [true, true, true, false];
    skillDesc = "Multi-step timing, pan-searing & delicate reduction techniques.";
  } else if (norm.includes("medium") || norm.includes("moderate") || norm.includes("intermed")) {
    level = 2;
    label = "Medium";
    color = "#D97706"; // amber
    bg = "#FEF3C7";
    border = "#FDE68A";
    icon = "🍳";
    meter = [true, true, false, false];
    skillDesc = "Standard sautés, boiling & basic seasoning adjustments.";
  }

  const fontSize = size === "sm" ? 10 : size === "md" ? 11 : 12;
  const padding = size === "sm" ? "2px 7px" : size === "md" ? "4px 10px" : "6px 12px";

  if (variant === "badge") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: bg,
          color: color,
          border: `1px solid ${border}`,
          borderRadius: 8,
          padding: padding,
          fontSize: fontSize,
          fontWeight: 800,
          whiteSpace: "nowrap"
        }}
        title={`Difficulty Level ${level}/4: ${skillDesc}`}
      >
        <span>{icon}</span>
        <span>{label}</span>
        {/* Visual Level Bars */}
        <div style={{ display: "flex", gap: 2.5, alignItems: "center", marginLeft: 2 }}>
          {meter.map((active, i) => (
            <span
              key={i}
              style={{
                width: 3,
                height: 8,
                borderRadius: 2,
                background: active ? color : `${color}35`,
                display: "inline-block"
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "gauge") {
    return (
      <div
        style={{
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: 12,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 850, color: color }}>
              {label} Difficulty
            </div>
            <div style={{ fontSize: 9, color: `${color}CC`, fontWeight: 700 }}>
              Skill Level {level} of 4
            </div>
          </div>
        </div>

        {/* Level Meter Progress Bar */}
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {meter.map((active, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 16,
                borderRadius: 3,
                background: active ? color : `${color}25`,
                border: `1px solid ${active ? color : `${color}40`}`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Full Expanded Variant
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: "12px 14px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 850, color: color }}>
            {label} ({level}/4)
          </span>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {meter.map((active, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 18,
                borderRadius: 4,
                background: active ? color : `${color}25`,
                boxShadow: active ? `0 1px 4px ${color}40` : "none"
              }}
            />
          ))}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: `${color}EE`, lineHeight: 1.4, fontWeight: 600 }}>
        💡 {skillDesc}
      </p>
    </div>
  );
};

export default RecipeDifficultyBadge;
