import React from "react";
import { Check } from "lucide-react";
import { H9 } from "./trackingShared";

export type TrackingStep = { id: string; icon: React.ReactNode; label: string; desc: string };

export function OrderTrackingTimeline({
  safeStatus,
  steps,
}: {
  safeStatus: number;
  steps: TrackingStep[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6" id="tracking-timeline">
      <h3 className="text-2xl uppercase text-foreground mb-6" style={H9}>Línea de Tiempo</h3>
      <div className="flex flex-col gap-0 sm:hidden">
        {steps.map((s, i) => {
          const done = i < safeStatus;
          const current = i === safeStatus;
          return (
            <div key={s.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm
                  ${done ? "bg-[#179150] text-white" : current ? "bg-[#50e9f8] text-[#006064] ring-4 ring-[#50e9f8]/20" : "bg-[#e0f5eb] text-[#179150]/40"}`}>
                  {done ? <Check size={18} /> : s.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-px flex-1 my-1 ${done ? "bg-[#179150]" : "border-l-2 border-dashed border-border"}`} style={{ minHeight: 32 }} />
                )}
              </div>
              <div className="pb-6 pt-2 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs uppercase font-black ${current ? "text-[#006064]" : done ? "text-[#179150]" : "text-muted-foreground"}`} style={H9}>{i + 1}. {s.label}</span>
                  {current && <span className="w-2 h-2 bg-[#50e9f8] rounded-full animate-pulse flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="hidden sm:flex items-start">
        {steps.map((s, i) => {
          const done = i < safeStatus;
          const current = i === safeStatus;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center text-center flex-1 min-w-0">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all shadow-sm
                  ${done ? "bg-[#179150] text-white" : current ? "bg-[#50e9f8] text-[#006064] ring-4 ring-[#50e9f8]/20" : "bg-[#e0f5eb] text-[#179150]/50"}`}>
                  {done ? <Check size={22} /> : s.icon}
                </div>
                <div className={`text-xs uppercase font-black mb-1 leading-tight ${current ? "text-[#006064]" : done ? "text-[#179150]" : "text-muted-foreground/50"}`} style={H9}>
                  {i + 1}. {s.label}
                </div>
                <p className={`text-[11px] leading-relaxed px-1 ${current || done ? "text-muted-foreground" : "text-muted-foreground/40"}`}>{s.desc}</p>
                {current && <span className="mt-1.5 text-[10px] text-[#179150] font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#50e9f8] rounded-full animate-pulse" />En curso</span>}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-shrink-0 w-8 mt-7 border-t-2 border-dashed ${done ? "border-[#179150]" : "border-border"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

