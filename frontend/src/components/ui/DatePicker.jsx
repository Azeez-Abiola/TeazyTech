import React, { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Local-timezone ISO (YYYY-MM-DD) — toISOString() would shift the day for UTC+ users
const toISO = (d) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Custom dropdown calendar. `value` is a YYYY-MM-DD string or "";
 * `onChange` receives the new YYYY-MM-DD string ("" when cleared).
 */
const DatePicker = ({ value, onChange, placeholder = "Select date", disableFuture = true }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = value ? new Date(`${value}T00:00:00`) : null;
  const [viewDate, setViewDate] = useState(selected || new Date());

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggle = () => {
    setOpen((o) => {
      if (!o) setViewDate(selected || new Date());
      return !o;
    });
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();

  // 6 fixed weeks starting from the Sunday on/before the 1st
  const gridStart = new Date(year, month, 1 - new Date(year, month, 1).getDay());
  const cells = Array.from(
    { length: 42 },
    (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i),
  );

  const pick = (day) => {
    onChange(toISO(day));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={toggle}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
          open
            ? "border-[#2F6FCC] ring-2 ring-[#2F6FCC]/20"
            : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
        } bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-200`}
      >
        <Calendar className="h-4 w-4 text-[#2F6FCC]" />
        {selected
          ? selected.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
          : <span className="text-gray-400">{placeholder}</span>}
        {selected ? (
          <span
            role="button"
            title="Clear date"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setOpen(false);
            }}
            className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#242424]"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : (
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[300px] max-w-none rounded-2xl border border-gray-100 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-[#1a1a1a]">
          {/* Month header */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-[#242424] dark:hover:text-gray-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-[#242424] dark:hover:text-gray-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday row */}
          <div className="grid grid-cols-7">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1 text-center text-[11px] font-semibold uppercase text-gray-400 dark:text-gray-500">
                {d}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day) => {
              const outside = day.getMonth() !== month;
              const future = disableFuture && day > today && !isSameDay(day, today);
              const isSelected = isSameDay(day, selected);
              const isToday = isSameDay(day, today);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={future}
                  onClick={() => pick(day)}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors
                    ${isSelected
                      ? "bg-[#2F6FCC] font-semibold text-white"
                      : isToday
                        ? "font-semibold text-[#2F6FCC] ring-1 ring-inset ring-[#2F6FCC]/50"
                        : outside
                          ? "text-gray-300 dark:text-gray-600"
                          : "text-gray-700 dark:text-gray-200"}
                    ${future
                      ? "cursor-not-allowed opacity-40"
                      : isSelected
                        ? ""
                        : "hover:bg-blue-50 dark:hover:bg-blue-500/10"}
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => pick(today)}
              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#2F6FCC] hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
