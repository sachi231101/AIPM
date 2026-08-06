import { useState, useRef, useEffect } from "react";
import { convertImageToBase64 } from "../../utils/resumeStorage";
import ModernTemplate from "../ResumeTemplates/ModernTemplate";
import ProfessionalTemplate from "../ResumeTemplates/ProfessionalTemplate";
import MinimalTemplate from "../ResumeTemplates/MinimalTemplate";
import ExecutiveTemplate from "../ResumeTemplates/ExecutiveTemplate";
import StudentTemplate from "../ResumeTemplates/StudentTemplate";

export default function ResumePreview({ resume, onClose }) {
  const [zoom, setZoom] = useState(100);
  const [deviceMode, setDeviceMode] = useState("desktop"); // desktop, mobile
  const [autoScale, setAutoScale] = useState(1);
  const containerRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) {
          const baseW = 800;
          const availableW = w - 16;
          if (availableW < baseW) {
            setAutoScale(Math.max(0.32, availableW / baseW));
          } else {
            setAutoScale(1);
          }
        }
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!resume) return null;
  const templateKey = resume.settings?.template || "modern";

  const renderTemplate = () => {
    switch (templateKey) {
      case "professional":
        return <ProfessionalTemplate resume={resume} />;
      case "minimal":
        return <MinimalTemplate resume={resume} />;
      case "executive":
        return <ExecutiveTemplate resume={resume} />;
      case "student":
        return <StudentTemplate resume={resume} />;
      case "modern":
      default:
        return <ModernTemplate resume={resume} />;
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  // Download direct PDF file using html2pdf library
  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    const docElement = previewRef.current.querySelector(".resume-document");
    if (!docElement) return;

    let tempContainer = null;
    try {
      setIsDownloading(true);
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // Create a temporary container to eliminate scale and offset glitches
      tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "0px";
      tempContainer.style.top = "0px";
      tempContainer.style.width = "800px";
      tempContainer.style.zIndex = "-9999";
      tempContainer.style.background = "#ffffff";
      tempContainer.style.opacity = "0.01";

      const clone = docElement.cloneNode(true);
      clone.style.transform = "none";
      clone.style.margin = "0";
      clone.style.boxShadow = "none";
      clone.style.minHeight = "auto";
      clone.style.height = "auto";
      clone.style.webkitFontSmoothing = "antialiased";
      clone.style.textRendering = "optimizeLegibility";

      // Convert all images in clone to base64 Data URIs so html2canvas captures them 100% reliably
      const images = Array.from(clone.querySelectorAll("img"));
      await Promise.all(
        images.map(async (img) => {
          const src = img.getAttribute("src") || img.src;
          if (!src || src.startsWith("data:")) return;
          try {
            const base64 = await convertImageToBase64(src);
            if (base64 && base64.startsWith("data:image")) {
              img.setAttribute("src", base64);
              img.src = base64;
            }
          } catch (e) {
            console.warn("Could not convert image to base64 for PDF export:", e);
          }
        })
      );

      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // Wait for all images in clone to be completely loaded in DOM
      await Promise.all(
        Array.from(clone.querySelectorAll("img")).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const filename = `${(resume.personal?.fullName || "Resume").replace(/\s+/g, "_")}_Resume.pdf`;
      const opt = {
        margin: [0.25, 0.25, 0.25, 0.25],
        filename: filename,
        image: { type: "png", quality: 1.0 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          letterRendering: true,
          allowTaint: true
        },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait", compress: true },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
      };

      await window.html2pdf().set(opt).from(clone).save();
    } catch (err) {
      console.error("html2pdf failed, falling back to browser print", err);
      window.print();
    } finally {
      if (tempContainer && document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      setIsDownloading(false);
    }
  };

  // Export DOCX / Word-compatible document
  const handleExportDOCX = () => {
    if (!previewRef.current) return;
    const content = previewRef.current.innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${resume.personal?.fullName || "Resume"}</title></head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(resume.personal?.fullName || "resume").replace(/\s+/g, "_")}_Resume.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="resume-preview-container d-flex flex-column h-100 bg-dark bg-opacity-10 p-2 p-md-3 rounded-3 border overflow-hidden">
      {/* Controls Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 bg-white rounded-3 shadow-sm mb-3">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary text-uppercase px-2 py-1">{templateKey} Template</span>
          <span className="small text-muted fw-semibold d-none d-sm-inline">Real-Time Live Preview</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Zoom Controls */}
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-secondary" onClick={() => setZoom((z) => Math.max(50, z - 10))} title="Zoom Out">
              <i className="bi bi-zoom-out"></i>
            </button>
            <span className="btn btn-light disabled px-2 fw-medium">{zoom}%</span>
            <button className="btn btn-outline-secondary" onClick={() => setZoom((z) => Math.min(150, z + 10))} title="Zoom In">
              <i className="bi bi-zoom-in"></i>
            </button>
          </div>

          {/* Download PDF Button */}
          <button className="btn btn-success btn-sm d-flex align-items-center gap-1" onClick={handleDownloadPDF} disabled={isDownloading}>
            {isDownloading ? (
              <><span className="spinner-border spinner-border-sm me-1"></span> Generating...</>
            ) : (
              <><i className="bi bi-file-earmark-pdf"></i> Download PDF</>
            )}
          </button>

          {/* Close Button */}
          {onClose && (
            <button className="btn-close ms-2" onClick={onClose} aria-label="Close preview"></button>
          )}
        </div>
      </div>

      {/* Preview Viewport */}
      {(() => {
        const settings = resume.settings || {};
        const fontFamily = settings.fontFamily || "Inter";
        const fontStyle = settings.fontStyle || "normal";
        const fontSizeMap = { small: "0.82rem", medium: "0.92rem", large: "1.05rem", xlarge: "1.18rem" };
        const lineSpacingMap = { compact: "1.2", normal: "1.5", spacious: "1.8" };
        const effectiveScale = autoScale * (zoom / 100);
        const baseW = 800;

        return (
          <div
            ref={containerRef}
            className="flex-grow-1 overflow-auto d-flex justify-content-center align-items-start p-1 p-md-3"
            style={{ width: "100%", height: "100%", position: "relative" }}
          >
            <div
              className="preview-scale-wrapper position-relative"
              style={{
                width: `${baseW * effectiveScale}px`,
                transition: "width 0.15s ease",
              }}
            >
              <div
                className="preview-wrapper shadow-sm rounded-3 bg-white"
                style={{
                  width: `${baseW}px`,
                  minWidth: `${baseW}px`,
                  transform: `scale(${effectiveScale})`,
                  transformOrigin: "top left",
                  fontFamily: fontFamily,
                  fontStyle: fontStyle,
                  fontSize: fontSizeMap[settings.fontSize] || "0.92rem",
                  lineHeight: lineSpacingMap[settings.lineSpacing] || "1.5",
                }}
                ref={previewRef}
              >
                {renderTemplate()}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
