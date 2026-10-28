import React, { createContext, useCallback, useContext, useState } from "react";
import { IoCheckmarkCircle, IoWarning, IoInformationCircle, IoClose } from "react-icons/io5";

const ToastContext = createContext(() => {});

const TONES = {
  success: { icon: IoCheckmarkCircle, cls: "border-emerald-500/30", iconCls: "text-emerald-400" },
  error: { icon: IoWarning, cls: "border-rose-500/30", iconCls: "text-rose-400" },
  info: { icon: IoInformationCircle, cls: "border-blue-500/30", iconCls: "text-blue-400" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message, tone = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t.slice(-2), { id, message, tone }]);
      setTimeout(() => dismiss(id), 3200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-auto" aria-live="polite">
        {toasts.map(({ id, message, tone }) => {
          const { icon: Icon, cls, iconCls } = TONES[tone] || TONES.success;
          return (
            <div
              key={id}
              className={`hmis-toast flex items-center gap-2.5 bg-slate-800 border ${cls} text-slate-100 pl-3.5 pr-2 py-2.5 rounded-lg shadow-2xl sm:min-w-72 max-w-md`}
            >
              <Icon className={`${iconCls} text-lg shrink-0`} />
              <span className="text-sm flex-1">{message}</span>
              <button onClick={() => dismiss(id)} className="cursor-pointer p-1 text-slate-500 hover:text-white" aria-label="Dismiss">
                <IoClose />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
