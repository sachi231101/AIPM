import { useState, useRef } from "react";
import ModernTemplate from "../ResumeTemplates/ModernTemplate";
import ProfessionalTemplate from "../ResumeTemplates/ProfessionalTemplate";
import MinimalTemplate from "../ResumeTemplates/MinimalTemplate";
import ExecutiveTemplate from "../ResumeTemplates/ExecutiveTemplate";
import StudentTemplate from "../ResumeTemplates/StudentTemplate";

export default function ResumePreview({ resume, onClose }) {
  const [zoom, setZoom] = useState(100);
  const [deviceMode, setDeviceMode] = useState("desktop"); // desktop, mobile
  const previewRef = useRef(null);

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

      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

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
    <div className="resume-preview-container d-flex flex-column h-100 bg-dark bg-opacity-10 p-3 rounded-3 border">
      {/* Controls Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 bg-white rounded-3 shadow-sm mb-3">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary text-uppercase px-2 py-1">{templateKey} Template</span>
          <span className="small text-muted fw-semibold">Real-Time Live Preview</span>
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
              <><span className="spinner-border spinner-border-sm me-1"></span> Generating PDF...</>
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
      <div className="flex-grow-1 overflow-auto d-flex justify-content-center p-2">
        <div
          className={`preview-wrapper transition-all ${deviceMode === "mobile" ? "mobile-viewport" : ""}`}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            width: deviceMode === "mobile" ? "380px" : "100%",
            maxWidth: deviceMode === "mobile" ? "380px" : "850px",
          }}
          ref={previewRef}
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
}
