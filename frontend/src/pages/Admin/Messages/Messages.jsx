import { useState } from "react";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { contactService } from "../../../services/api";
import { toast } from "react-toastify";
import { useCachedData } from "../../../hooks/useCachedData";

export default function Messages() {
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);

  const { data: rawMessagesResponse, loading, refresh } = useCachedData(
    "admin_messages",
    contactService.getAll
  );

  const messages = rawMessagesResponse?.data || [];

  const handleDelete = async () => {
    if (!deletingMessage) return;
    try {
      await contactService.delete(deletingMessage.id);
      toast.success("Message deleted successfully.");
      setDeletingMessage(null);
      refresh();
    } catch (err) {
      console.error("Failed to delete message", err);
      toast.error("Failed to delete contact message.");
    }
  };

  const filtered = messages.filter((m) => {
    const term = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.subject?.toLowerCase().includes(term) ||
      m.query_type?.toLowerCase().includes(term)
    );
  });

  const getQueryBadgeColor = (type) => {
    switch (type) {
      case "Student Placement Query":
        return "primary";
      case "Company Partnership":
        return "success";
      case "Institute Registration":
        return "info";
      case "Technical Support":
        return "warning text-dark";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5" style={{ height: "400px" }}>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading contact messages...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Contact Messages"
        subtitle="Manage inquiries from students, companies, and institutes"
        breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Messages" }]}
      />

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div className="input-group" style={{ maxWidth: 300 }}>
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                className="form-control border-start-0"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="badge bg-primary px-3 py-2">{filtered.length} Messages Found</span>
          </div>
        </div>

        <div className="card-body p-0 mt-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="py-3">Sender Details</th>
                  <th className="py-3">Query Type</th>
                  <th className="py-3">Subject</th>
                  <th className="py-3">Submitted At</th>
                  <th className="py-3 text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((msg, i) => (
                    <tr key={msg.id}>
                      <td className="px-4 text-muted">{i + 1}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-semibold text-dark">{msg.name}</span>
                          <span className="text-muted small">{msg.email}</span>
                          {msg.phone && <span className="text-muted small">{msg.phone}</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${getQueryBadgeColor(msg.query_type)} bg-opacity-10 text-${getQueryBadgeColor(msg.query_type)} border border-${getQueryBadgeColor(msg.query_type)} border-opacity-25`}>
                          {msg.query_type}
                        </span>
                      </td>
                      <td>
                        <span className="text-dark fw-medium text-truncate d-inline-block" style={{ maxWidth: 200 }} title={msg.subject}>
                          {msg.subject}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {new Date(msg.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="text-end px-4">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setSelectedMessage(msg)}
                            title="View Message Details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeletingMessage(msg)}
                            title="Delete Message"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted small">
                      No contact messages found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white border-0 px-4 py-3">
          <small className="text-muted">Showing {filtered.length} of {messages.length} messages</small>
        </div>
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">Inquiry Details</h5>
                <button className="btn-close" onClick={() => setSelectedMessage(null)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label className="text-muted small fw-medium mb-1 d-block">Sender Name</label>
                    <span className="fw-semibold text-dark">{selectedMessage.name}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small fw-medium mb-1 d-block">Email Address</label>
                    <a href={`mailto:${selectedMessage.email}`} className="fw-semibold text-decoration-none">{selectedMessage.email}</a>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small fw-medium mb-1 d-block">Phone Number</label>
                    <span className="fw-semibold text-dark">{selectedMessage.phone || "Not Provided"}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small fw-medium mb-1 d-block">Query Type</label>
                    <span className={`badge bg-${getQueryBadgeColor(selectedMessage.query_type)} bg-opacity-10 text-${getQueryBadgeColor(selectedMessage.query_type)} border border-${getQueryBadgeColor(selectedMessage.query_type)} border-opacity-25`}>
                      {selectedMessage.query_type}
                    </span>
                  </div>
                  <div className="col-12">
                    <label className="text-muted small fw-medium mb-1 d-block">Subject</label>
                    <span className="fw-bold text-dark">{selectedMessage.subject}</span>
                  </div>
                </div>

                <hr className="text-muted my-3 opacity-25" />

                <div className="bg-light p-3 rounded-3" style={{ whiteSpace: "pre-wrap" }}>
                  <label className="text-muted small fw-medium mb-2 d-block">Message</label>
                  <p className="text-dark mb-0 fs-6">{selectedMessage.message}</p>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary" onClick={() => setSelectedMessage(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMessage && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h6 className="modal-title fw-bold text-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>Confirm Delete
                </h6>
                <button className="btn-close" onClick={() => setDeletingMessage(null)}></button>
              </div>
              <div className="modal-body py-3">
                <p className="mb-0">
                  Are you sure you want to delete the message from <strong>{deletingMessage.name}</strong> regarding "
                  <em>{deletingMessage.subject}</em>"? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary" onClick={() => setDeletingMessage(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
