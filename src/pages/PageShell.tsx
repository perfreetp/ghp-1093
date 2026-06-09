import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/utils";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageShellProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

const routeBreadcrumbMap: Record<string, BreadcrumbItem[]> = {
  "/": [{ label: "总览" }],
  "/buildings": [{ label: "建筑档案" }],
  "/devices": [{ label: "设备台账" }],
  "/inspections": [{ label: "巡检任务" }],
  "/hazards": [{ label: "隐患整改" }],
  "/drills": [{ label: "演练记录" }],
  "/reports": [{ label: "统计报表" }],
};

export default function PageShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className,
}: PageShellProps) {
  const location = useLocation();

  const resolvedBreadcrumbs = breadcrumbs ??
    routeBreadcrumbMap[location.pathname] ?? [
      { label: title || "当前页面" },
    ];

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-industrial-600 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>首页</span>
            </Link>
            {resolvedBreadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-slate-300" />
                {item.path && index < resolvedBreadcrumbs.length - 1 ? (
                  <Link
                    to={item.path}
                    className="hover:text-industrial-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-700 font-medium">{item.label}</span>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-slate-500 mt-1">{description}</p>
              )}
            </div>

            {actions && (
              <div className="flex items-center gap-2 shrink-0">{actions}</div>
            )}
          </div>
        </div>
      </div>

      <div className="animate-stagger-in">{children}</div>
    </div>
  );
}
