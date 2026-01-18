import React, { useState, useEffect } from "react";
import Book from "./Book";

const FFFF = () => {
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    if (printMode) {
      const t = setTimeout(() => {
        window.print();
        setPrintMode(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [printMode]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans app-root">
      {/* CSS الطباعة A4 بدون هوامش بيضا */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            height: 100%;
            background: #ffffff !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .app-root {
            background: #ffffff !important;
            min-height: auto !important;
            padding: 0 !important;
          }
          .a4-page {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
          }
          .a4-page:last-child {
            page-break-after: auto;
          }
        }
      `}</style>

      {/* الهيدر + زرار توليد الـ PDF */}
      <div className="w-full max-w-[900px] no-print mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">
            A4 Book PDF Generator
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            غيّر كود الكتاب في Book.jsx واضغط Generate PDF علشان يطلع بصورته وستايله.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPrintMode(true)}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold shadow-md shadow-emerald-500/40 no-print"
        >
          Generate PDF
        </button>
      </div>

      {/* مساحة عرض الكتاب */}
      <div
        className={
          printMode
            ? "w-full"
            : "w-full max-w-[800px] aspect-[1/1.414] bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border-8 border-gray-700"
        }
      >
        {/* هنا كتابك إنت */}
        <Book printMode={printMode} />
      </div>
    </div>
  );
};

export default FFFF;
