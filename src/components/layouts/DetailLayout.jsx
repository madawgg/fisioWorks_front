import React from "react";

export default function DetailLayout({
  title,
  subtitle,
  children,
  actions,
  maxWidth = "800px",
  loading = false,
  error = null,
}) {
  if (loading) {
    return (
      <div className="container-fluid px-4 py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border text-olive" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid px-4 py-4">
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4 ">
      <div className="row justify-content-center">
        <div className="col-12" style={{ maxWidth: maxWidth }}>
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              {title && (
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-dark">{title}</h2>
                  {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
                </div>
              )}

              <div>{children}</div>

              {actions && (
                <div className="d-flex justify-content-center justify-content-md-end gap-3 mt-4 pt-3 border-top">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
