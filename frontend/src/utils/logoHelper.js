export const getCompanyLogo = (logoPath, companyName = "Company") => {
  if (!logoPath) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0F4C81&color=fff&size=128`;
  }
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
    return logoPath;
  }
  const cleanPath = logoPath.startsWith("/") ? logoPath.slice(1) : logoPath;
  return `http://localhost:8000/storage/${cleanPath}`;
};

export const handleLogoError = (e, companyName = "Company") => {
  e.target.onerror = null;
  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || "Company")}&background=0F4C81&color=fff&size=128`;
};
