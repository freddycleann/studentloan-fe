'use client';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export default function PdfViewer({ url }) {
  const wrapRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(0);

  // Size the PDF to its container, not the viewport — so it can't overflow the modal.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w > 0) setWidth(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!url) return null;
  const lower = url.toLowerCase();
  const isImage = /\.(png|jpe?g|gif|webp|avif)(\?|$)/.test(lower);

  if (isImage) {
    return (
      <div className="rounded-xl border border-gold-400/40 bg-ink-900/95 p-3">
        <img src={url} alt="" className="max-h-[70vh] w-full object-contain mx-auto rounded-lg" />
      </div>
    );
  }

  const isCloudinary = /res\.cloudinary\.com/.test(url);

  return (
    <div ref={wrapRef} className="rounded-xl border border-gold-400/40 bg-ink-900/95 p-3 max-h-[75vh] overflow-y-auto">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onError={() => {}}
        loading={<div className="p-6 text-gold-200 text-sm">Loading PDF…</div>}
        error={
          <div className="p-6 text-sm space-y-3">
            <div className="text-red-200 font-semibold">Couldn’t load this PDF.</div>
            {isCloudinary && (
              <div className="rounded-xl border border-amber-300/60 bg-amber-900/30 p-3 text-amber-100">
                <div className="font-semibold mb-1">Likely cause: Cloudinary PDF delivery is disabled</div>
                <div className="text-xs leading-relaxed">
                  By default Cloudinary blocks <code>.pdf</code> URLs as a security measure.
                  Open{' '}
                  <a
                    className="underline hover:text-amber-50"
                    href="https://console.cloudinary.com/settings/security"
                    target="_blank" rel="noreferrer"
                  >
                    Cloudinary → Settings → Security
                  </a>
                  , tick <strong>“Allow delivery of PDF and ZIP files”</strong>, save, then refresh this page.
                </div>
              </div>
            )}
            <a className="underline text-gold-200 hover:text-gold-100" href={url} target="_blank" rel="noreferrer">
              Open in new tab ↗
            </a>
          </div>
        }
      >
        {width > 0 && (
          <Page
            pageNumber={page}
            width={width - 24}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        )}
      </Document>
      {numPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-xs text-gold-100">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-ghost text-xs disabled:opacity-40"
          >
            ‹ Prev
          </button>
          <div className="tracking-widest">{page} / {numPages}</div>
          <button
            onClick={() => setPage(p => Math.min(numPages, p + 1))}
            disabled={page >= numPages}
            className="btn-ghost text-xs disabled:opacity-40"
          >
            Next ›
          </button>
        </div>
      )}
      <div className="mt-2 text-center">
        <a href={url} target="_blank" rel="noreferrer" className="text-xs text-gold-300 hover:text-gold-200 underline-offset-4 hover:underline">
          Open in new tab ↗
        </a>
      </div>
    </div>
  );
}
