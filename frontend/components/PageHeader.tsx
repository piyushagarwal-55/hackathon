import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon, actions, children }: PageHeaderProps) {
  return (
    <header className="border-b border-slate-800/50 bg-slate-950/55 backdrop-blur-xl">
      <div className="rv-container py-5">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {icon ? (
                <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-center">
                  {icon}
                </div>
              ) : null}
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
                ) : null}
              </div>
            </div>
            {children ? <div className="mt-4">{children}</div> : null}
          </div>

          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}


