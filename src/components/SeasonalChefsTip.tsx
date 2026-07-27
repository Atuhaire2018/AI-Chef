import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, RefreshCw, Calendar, Lightbulb, ExternalLink, Plus, Check } from "lucide-react";

export interface SeasonalProduceItem {
  name: string;
  emoji: string;
  tasteProfile: string;
  chefTip: string;
}

export interface SeasonalTipsData {
  month: string;
  season: string;
  produce: SeasonalProduceItem[];
  masterTipTitle: string;
  masterTipContent: string;
  pairingRecommendation: string;
  grounded?: boolean;
}

export interface SeasonalChefsTipProps {
  themeColors: any;
  onAddIngredient?: (ingredientName: string) => void;
  selectedIngredients?: string[];
}

export const SeasonalChefsTip: React.FC<SeasonalChefsTipProps> = ({
  themeColors: C,
  onAddIngredient,
  selectedIngredients = []
}) => {
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
  const [data, setData] = useState<SeasonalTipsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const fetchSeasonalTips = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seasonal-tips?month=${encodeURIComponent(currentMonth)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        throw new Error("Failed to load seasonal tips");
      }
    } catch (err) {
      console.warn("Seasonal tips fetch warning, using fallback:", err);
      setData({
        month: currentMonth,
        season: "Peak Harvest",
        produce: [
          { name: "Heirloom Tomatoes", emoji: "🍅", tasteProfile: "Rich umami & sweet acid balance", chefTip: "Never refrigerate! Slice thick and season with flake sea salt." },
          { name: "Sweet Peaches", emoji: "🍑", tasteProfile: "Juicy, floral aromatic sweetness", chefTip: "Grill halves on a hot skillet to caramelize natural sugars." },
          { name: "Fresh Basil", emoji: "🌿", tasteProfile: "Peppery anise, bright herb aroma", chefTip: "Tear with hands rather than chopping with steel." },
          { name: "Sweet Corn", emoji: "🌽", tasteProfile: "Crisp, milky kernel sweetness", chefTip: "Char directly over an open gas flame or hot grill." }
        ],
        masterTipTitle: `Master Chef ${currentMonth} Preservation Technique`,
        masterTipContent: `Peak produce in ${currentMonth} requires minimal processing. Highlight natural acidity with sea salt, high-grade olive oil, and gentle searing.`,
        pairingRecommendation: "Pairs exquisitely with burrata cheese, aged balsamic glaze, and sourdough.",
        grounded: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasonalTips();
  }, []);

  const handleToggleAdd = (item: SeasonalProduceItem) => {
    if (onAddIngredient) {
      onAddIngredient(item.name);
      setAddedItems((prev) => ({
        ...prev,
        [item.name]: !prev[item.name]
      }));
    }
  };

  return (
    <div
      style={{
        background: C.white,
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.02)"
      }}
    >
      {/* HEADER ROW */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              background: "#FEF3C7",
              color: "#D97706",
              padding: "6px",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #FDE68A"
            }}
          >
            <Calendar size={16} />
          </span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 850, color: C.text, fontFamily: "'Playfair Display', serif" }}>
                Chef's Tip: {data?.month || currentMonth} Seasonal Produce
              </span>
              {data?.grounded && (
                <span
                  style={{
                    background: "#EFF6FF",
                    color: "#2563EB",
                    border: "1px solid #BFDBFE",
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3
                  }}
                  title="Grounded live with Google Search API"
                >
                  <Sparkles size={10} /> Google Search Grounded
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>
              Peak harvest recommendations & culinary flavor pairings
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchSeasonalTips}
          disabled={loading}
          style={{
            background: "#FAF8F4",
            border: `1px solid ${C.border}`,
            color: C.muted,
            padding: "4px 10px",
            borderRadius: 10,
            fontSize: 10,
            fontWeight: 750,
            cursor: loading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4
          }}
          title="Refresh seasonal recommendations via Google Search"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          {loading ? "Searching..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                minWidth: 160,
                height: 80,
                background: "#F5EFE6",
                borderRadius: 12,
                animation: "pulse 1.2s infinite"
              }}
            />
          ))}
        </div>
      ) : data ? (
        <div>
          {/* PRODUCE HORIZONTAL CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 10,
              marginBottom: 12
            }}
          >
            {data.produce.map((item, idx) => {
              const isSelected =
                selectedIngredients.some((ing) => ing.toLowerCase() === item.name.toLowerCase()) ||
                addedItems[item.name];

              return (
                <div
                  key={idx}
                  style={{
                    background: "#FAF8F4",
                    border: `1px solid ${isSelected ? C.primary : C.border}`,
                    borderRadius: 12,
                    padding: 10,
                    position: "relative",
                    transition: "all 0.15s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 18 }}>{item.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>
                        {item.name}
                      </span>
                    </div>

                    {onAddIngredient && (
                      <button
                        type="button"
                        onClick={() => handleToggleAdd(item)}
                        style={{
                          background: isSelected ? C.primary : "white",
                          color: isSelected ? "white" : C.primary,
                          border: `1px solid ${C.primary}`,
                          borderRadius: 8,
                          padding: "2px 6px",
                          fontSize: 9,
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 3
                        }}
                      >
                        {isSelected ? <Check size={10} /> : <Plus size={10} />}
                        {isSelected ? "Added" : "Add"}
                      </button>
                    )}
                  </div>

                  <div style={{ fontSize: 10, color: C.primary, fontWeight: 700, marginBottom: 4 }}>
                    👅 {item.tasteProfile}
                  </div>

                  <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.35, fontStyle: "italic" }}>
                    "{item.chefTip}"
                  </div>
                </div>
              );
            })}
          </div>

          {/* MASTER CHEF TECHNIQUE BOX */}
          <div
            style={{
              background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
              border: "1px solid #FDE68A",
              borderRadius: 12,
              padding: "10px 12px",
              display: "flex",
              alignItems: "flex-start",
              gap: 8
            }}
          >
            <Lightbulb size={16} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 850, color: "#92400E", marginBottom: 2 }}>
                {data.masterTipTitle}
              </div>
              <div style={{ fontSize: 11, color: "#78350F", lineHeight: 1.4 }}>
                {data.masterTipContent}
              </div>
              {data.pairingRecommendation && (
                <div style={{ fontSize: 10, color: "#B45309", marginTop: 4, fontWeight: 700 }}>
                  🍷 Pairing: {data.pairingRecommendation}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SeasonalChefsTip;
