import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Pencil, Ban, Check, Info } from "lucide-react";
import { useApp } from "../context/AppContext";
import { bookingSources, type CommissionRule } from "../types";
import { percent } from "../utils/currency";
import { date } from "../utils/dates";
import { validateRule } from "../utils/financial";
import {
  Badge,
  Button,
  Empty,
  PageHeader,
  PropertyFilter,
  Select,
} from "../components/UI";
import { RuleForm } from "../components/Forms";
export default function CommissionRules() {
  const { rules, properties, toggleRule, notify } = useApp();
  const [params] = useSearchParams();
  const [property, setProperty] = useState(params.get("property") || "");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<CommissionRule | undefined>(
    rules.find((r) => r.id === params.get("rule")),
  );
  const [open, setOpen] = useState(!!editing);
  const rows = rules.filter(
    (r) =>
      (!property || r.propertyId === property) &&
      (!source || r.source === source) &&
      (!status || (status === "Active") === r.enabled),
  );
  return (
    <>
      <PageHeader
        title="Commission rules"
        description="Property and booking source rules that power your financial calculations."
        actions={
          <Button
            primary
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
          >
            <Plus size={16} />
            Add rule
          </Button>
        }
      />
      <div className="filter-toolbar">
        <div className="filter-group">
          <PropertyFilter value={property} onChange={setProperty} />
          <Select
            label="Booking source"
            value={source}
            onChange={setSource}
            options={[
              { value: "", label: "All sources" },
              ...bookingSources.map((s) => ({ value: s, label: s })),
            ]}
          />
          <Select
            label="Rule status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "", label: "All statuses" },
              { value: "Active", label: "Active" },
              { value: "Disabled", label: "Disabled" },
            ]}
          />
        </div>
        <span className="muted subtle">{rows.length} rules</span>
      </div>
      <section className="panel">
        {rows.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Source</th>
                  <th className="num">TLT commission</th>
                  <th className="num">Agent commission</th>
                  <th>Effective from</th>
                  <th>Effective until</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className={
                      r.id === params.get("rule") ? "highlight-row" : ""
                    }
                  >
                    <td className="table-title">
                      {properties.find((p) => p.id === r.propertyId)?.name}
                    </td>
                    <td>{r.source}</td>
                    <td className="num">{percent(r.tltCommissionRate)}</td>
                    <td className="num">{percent(r.agentCommissionRate)}</td>
                    <td>{date(r.effectiveFrom)}</td>
                    <td>{date(r.effectiveUntil)}</td>
                    <td>
                      <Badge>{r.enabled ? "Active" : "Disabled"}</Badge>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          aria-label={`Edit rule for ${properties.find((p) => p.id === r.propertyId)?.name} ${r.source}`}
                          onClick={() => {
                            setEditing(r);
                            setOpen(true);
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`${r.enabled ? "Disable" : "Enable"} rule for ${properties.find((p) => p.id === r.propertyId)?.name} ${r.source}`}
                          onClick={() => {
                            if (!r.enabled) {
                              const error = validateRule(
                                { ...r, enabled: true },
                                rules,
                              );
                              if (error) {
                                notify(error);
                                return;
                              }
                            }
                            toggleRule(r.id);
                          }}
                        >
                          {r.enabled ? <Ban size={14} /> : <Check size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
      </section>
      <div className="info-note">
        <Info size={16} />
        <p>
          Rules apply by property, booking source and check-in date. Changes
          update calculations immediately. Disabling a rule flags affected
          reservations for review.
        </p>
      </div>
      {open && <RuleForm rule={editing} onClose={() => setOpen(false)} />}
    </>
  );
}
