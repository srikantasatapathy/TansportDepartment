"use client";

export default function ChartCard({ title, icon: Icon, accent = "#0b3d91", children, className = "", action }) {
  return (
    <div className={`card flex flex-col p-4 animate-fadeIn ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}1a`, color: accent }}>
              <Icon size={16} />
            </span>
          )}
          <h3 className="text-sm font-bold text-slate-700">{title}</h3>
        </div>
        {action}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
