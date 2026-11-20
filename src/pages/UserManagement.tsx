import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Badge, Button, Field, Modal, PageHeader } from "../components/UI";
import { useApp } from "../context/AppContext";
import {
  accessModules, adminRoleId, adminUserId, modules,
  type WorkspaceRole, type WorkspaceUser,
} from "../data/access";
import { createId } from "../utils/id";

type Editor = { kind: "user"; user?: WorkspaceUser } | { kind: "role"; role?: WorkspaceRole };

export default function UserManagement() {
  const { users, roles, previewUserId, startAccessPreview } = useApp();
  const [editor, setEditor] = useState<Editor>();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="User Management"
        description="Manage workspace users and choose which pages each role can access."
        actions={<Button primary onClick={() => setEditor({ kind: "user" })}><Plus size={16} /> Add user</Button>}
      />
      <section className="panel">
        <div className="panel-heading"><h2>Users</h2></div>
        <div className="table-scroll">
          <table aria-label="Workspace users">
            <thead>
              <tr>
                <th scope="col">Name</th><th scope="col">Email</th>
                <th scope="col">Role</th><th scope="col">Status</th><th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const role = roles.find((item) => item.id === user.roleId);
                return (
                  <tr key={user.id}>
                    <th scope="row" className="access-row-name">{user.name}</th>
                    <td>{user.email}</td>
                    <td>{role?.name}</td>
                    <td><Badge>{user.active ? "Active" : "Inactive"}</Badge></td>
                    <td>
                      {user.id === adminUserId ? <span className="muted">Workspace owner</span> : (
                        <div className="access-row-actions">
                          <Button className="small" onClick={() => setEditor({ kind: "user", user })}>Edit<span className="sr-only"> {user.name}</span></Button>
                          {!previewUserId && user.active && (
                            <Button className="small" onClick={() => {
                              startAccessPreview(user.id);
                              const destination = modules.find((module) => role?.modules.includes(module));
                              if (destination) navigate(destination);
                            }}>Preview access<span className="sr-only"> for {user.name}</span></Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel spaced-panel">
        <div className="panel-heading">
          <div><h2>Roles &amp; access</h2><p>Changes apply to everyone assigned to the role.</p></div>
          <Button onClick={() => setEditor({ kind: "role" })}><Plus size={16} /> Add role</Button>
        </div>
        <div className="table-scroll">
          <table aria-label="Roles and page permissions">
            <thead><tr><th scope="col">Role</th><th scope="col">Page access</th><th scope="col">Actions</th></tr></thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <th scope="row" className="access-row-name">{role.name}</th>
                  <td className="access-module-list">
                    {role.id === adminRoleId ? "All pages" :
                      role.modules.map((module) => accessModules[module]).join(", ") || "No pages"}
                  </td>
                  <td>{role.id === adminRoleId ? <span className="muted">Built-in role</span> : (
                    <Button className="small" onClick={() => setEditor({ kind: "role", role })}>Edit access<span className="sr-only"> for {role.name}</span></Button>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {editor?.kind === "user" && <UserForm user={editor.user} onClose={() => setEditor(undefined)} />}
      {editor?.kind === "role" && <RoleForm role={editor.role} onClose={() => setEditor(undefined)} />}
    </>
  );
}

function UserForm({ user, onClose }: { user?: WorkspaceUser; onClose: () => void }) {
  const { users, roles, saveUser } = useApp();
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const email = String(form.get("email")).trim().toLowerCase();
    if (!name) return setError("Enter a name.");
    if (users.some((item) => item.id !== user?.id && item.email.toLowerCase() === email)) {
      return setError("A user already has this email. Enter a different email.");
    }
    saveUser({
      id: user?.id ?? createId(),
      name, email,
      roleId: String(form.get("role")),
      active: form.get("status") === "active",
    });
    onClose();
  }

  return (
    <Modal title={user ? "Edit user" : "Add user"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-body">
          {error && <p className="form-error" role="alert">{error}</p>}
          <Field label="Name"><input name="name" required maxLength={80} defaultValue={user?.name} /></Field>
          <Field label="Email"><input name="email" type="email" required maxLength={254} defaultValue={user?.email} /></Field>
          <div className="form-grid">
            <Field label="Role">
              <select name="role" required defaultValue={user?.roleId ?? ""}>
                <option value="" disabled>Select role</option>
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select name="status" defaultValue={user?.active === false ? "inactive" : "active"}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
        </div>
        <div className="form-actions">
          <Button onClick={onClose}>Cancel</Button><Button primary type="submit">Save user</Button>
        </div>
      </form>
    </Modal>
  );
}

function RoleForm({ role, onClose }: { role?: WorkspaceRole; onClose: () => void }) {
  const { roles, saveRole } = useApp();
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    if (!name) return setError("Enter a role name.");
    if (roles.some((item) => item.id !== role?.id && item.name.toLowerCase() === name.toLowerCase())) {
      return setError("This role name is already in use. Enter a different name.");
    }
    saveRole({
      id: role?.id ?? createId(),
      name,
      modules: modules.filter((module) => form.has(module)),
    });
    onClose();
  }

  return (
    <Modal title={role ? "Edit role access" : "Add role"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-body">
          {error && <p className="form-error" role="alert">{error}</p>}
          <Field label="Role name"><input name="name" required maxLength={60} defaultValue={role?.name} /></Field>
          <fieldset className="access-permissions">
            <legend>Page access</legend>
            <div className="access-permission-grid">
              {modules.map((module) => (
                <label key={module}>
                  <input type="checkbox" name={module} defaultChecked={role?.modules.includes(module)} />
                  {accessModules[module]}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="form-actions">
          <Button onClick={onClose}>Cancel</Button><Button primary type="submit">Save role</Button>
        </div>
      </form>
    </Modal>
  );
}
