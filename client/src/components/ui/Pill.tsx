/**
 * Pill — coloured chip used for skills, tags, badges.
 *
 * Usage:
 *   <Pill label="LangChain" color="#10b981" />
 *   <Pill label="Gap" />          // defaults to blue accent
 *   <Pill label="Active" solid /> // solid fill (e.g. selected state)
 */

interface PillProps {
  label:     string;
  color?:    string;   // hex — controls text, border, and bg tint
  solid?:    boolean;  // filled background (white text)
  className?: string;
}

export default function Pill({ label, color = '#1e6ef4', solid = false, className = '' }: PillProps) {
  const style = solid
    ? { backgroundColor: color, color: '#ffffff', border: `1px solid ${color}` }
    : { color, backgroundColor: `${color}18`, border: `1px solid ${color}40` };

  return (
    <span
      className={`text-[11px] font-semibold px-[10px] py-[4px] rounded-full ${className}`}
      style={style}
    >
      {label}
    </span>
  );
}
