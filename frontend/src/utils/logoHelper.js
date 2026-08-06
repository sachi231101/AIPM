export const getCompanyLogo = (logoPath, companyName = "Company") => {
  if (!logoPath) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0F4C81&color=fff&size=128`;
  }

  // If path contains /storage/, normalize it to domain-relative /storage/... path
  if (typeof logoPath === "string" && logoPath.includes("/storage/")) {
    const relativePath = logoPath.split("/storage/")[1];
    return `/storage/${relativePath}`;
  }

  // Absolute URLs (http/https) or root static paths (/logo.png)
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://") || logoPath.startsWith("/")) {
    return logoPath;
  }

  // Clean relative path to point directly to /storage/...
  const cleanPath = logoPath.replace(/^\//, "");
  return `/storage/${cleanPath}`;
};

export const handleLogoError = (e, companyName = "Company") => {
  e.target.onerror = null;
  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || "Company")}&background=0F4C81&color=fff&size=128`;
};
