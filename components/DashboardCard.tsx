type DashboardCardProps = {
  title: string;
  value: string;
  icon: string;
  color: string;
  linkText: string;
};

export default function DashboardCard({
  title,
  value,
  icon,
  color,
  linkText,
}: DashboardCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${color}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{value}</h2>
          <p className="mt-2 text-sm font-medium text-blue-600">{linkText} →</p>
        </div>
      </div>
    </div>
  );
}