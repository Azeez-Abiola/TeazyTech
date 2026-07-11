import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  Megaphone,
  Newspaper,
  Sparkles,
} from "lucide-react";

const CATEGORY_PALETTES = [
  { bg: "linear-gradient(135deg, #ebf3ff 0%, #dbeafe 100%)", circle: "#ffffff", icon: "#2F6FCC" },
  { bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", circle: "#ffffff", icon: "#44BBA4" },
  { bg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", circle: "#ffffff", icon: "#E94F37" },
  { bg: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", circle: "#ffffff", icon: "#233463" },
];

const CATEGORY_ICON_MAP = [
  { match: /lms|learning|course|education/i, Icon: GraduationCap },
  { match: /tech|digital|tool|ai/i, Icon: Lightbulb },
  { match: /news|update|announce/i, Icon: Megaphone },
  { match: /insight|tip|guide|tutorial/i, Icon: Sparkles },
  { match: /story|blog|article/i, Icon: Newspaper },
];

function hashCategory(category = "") {
  return category.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getBlogCardPalette(category) {
  return CATEGORY_PALETTES[hashCategory(category) % CATEGORY_PALETTES.length];
}

export function getBlogCardIcon(category) {
  const match = CATEGORY_ICON_MAP.find(({ match }) => match.test(category || ""));
  return match?.Icon ?? BookOpen;
}

export default function BlogCardIconHeader({ category, compact = false, dark = false }) {
  const Icon = getBlogCardIcon(category);
  const palette = getBlogCardPalette(category);

  if (dark) {
    return (
      <div className="blog-card-icon-header blog-card-icon-header--dark">
        <div className="blog-card-icon-header__circle blog-card-icon-header__circle--dark">
          <Icon size={compact ? 28 : 36} strokeWidth={1.75} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`blog-card-icon-header ${compact ? "blog-card-icon-header--compact" : ""}`}
      style={{ background: palette.bg }}
    >
      <div
        className="blog-card-icon-header__circle"
        style={{ background: palette.circle, color: palette.icon }}
      >
        <Icon size={compact ? 32 : 44} strokeWidth={1.75} />
      </div>
    </div>
  );
}
