import { useState } from "react";
import { institutes as initialInstitutes } from "../../../utils/mockData";
import PageHeader from "../../../components/PageHeader/PageHeader";
import { toast } from "react-toastify";

export default function Institutes() {
  const [institutes, setInstitutes] = useState(initialInstitutes.filter(i => i.name !== "Other"));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState(null);
  const [deletingInstitute, setDeletingInstitute] = useState(null);
  const [formName, setFormName] = useState("");
  const [search, setSearch] = useState("");

  const filtered = institutes.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!formName.trim()) { toast.error("Institute name is required"); return; }
    const newInst = { id: Date.now(), name: formName.trim() };
    setInstitutes([...institutes, newInst]);
    toast.success("Institute added successfully!");
    setFormName(""); setShowAddModal(false);
  };

  const handleEdit = () => {
    if (!formName.trim()) { toast.error("Name is required"); return; }
    setInstitutes(institutes.map(i => i.id === editingInstitute.id ? { ...i, name: formName } : i));
    toast.success("Institute updated!");
    setEditingInstitute(null); setFormName("");
  };

  const handleDelete = () => {
    setInstitutes(institutes.filter(i => i.id !== deletingInstitute.id));
    toast.success("Institute deleted.");
    setDeletingInstitute(null);
  };

  const openEdit = (inst) => { setEditingInstitute(inst); setFormName(inst.name); };

  return (
    <div>
      <PageHeader title="Institutes" subtitle="Manage partner institutes" breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Institutes" }]} />

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div className="input-group" style={{ maxWidth: 300 }}>
              <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
              <input className="form-control border-start-0" placeholder="Search institutes..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => { setFormName(""); setShowAddModal(true); }}>
              <i className="bi bi-plus-lg me-1"></i>Add Institute
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="py-3">Institute Name</th>
                  <th className="py-3 text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inst, i) => (
                  <tr key={inst.id}>
                    <td className="px-4 text-muted">{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-2 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                          <i className="bi bi-bank2 text-primary"></i>
                        </div>
                        <span className="fw-medium">{inst.name}</span>
                      </div>
                    </td>
                    <td className="text-end px-4">
                      <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(inst)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setDeletingInstitute(inst)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white border-0 px-4 py-3">
          <small className="text-muted">{filtered.length} institutes found</small>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0">
                <h6 className="modal-title fw-bold">Add New Institute</h6>
                <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <label className="form-label small fw-medium">Institute Name</label>
                <input className="form-control" placeholder="Enter institute name" value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd}>Add Institute</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingInstitute && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0">
                <h6 className="modal-title fw-bold">Edit Institute</h6>
                <button className="btn-close" onClick={() => setEditingInstitute(null)}></button>
              </div>
              <div className="modal-body">
                <label className="form-label small fw-medium">Institute Name</label>
                <input className="form-control" value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={() => setEditingInstitute(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingInstitute && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0">
                <h6 className="modal-title fw-bold text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Confirm Delete</h6>
                <button className="btn-close" onClick={() => setDeletingInstitute(null)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">Are you sure you want to delete <strong>{deletingInstitute.name}</strong>? This action cannot be undone.</p>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={() => setDeletingInstitute(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
