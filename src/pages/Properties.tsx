import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Info } from "lucide-react";
import { useApp } from "../context/AppContext";
import { percent } from "../utils/currency";
import { date } from "../utils/dates";
import {
  Badge,
  Empty,
  PageHeader,
  PMS,
  SearchBox,
  Select,
} from "../components/UI";
import { ReservationTable } from "../components/ReservationTable";
export default function Properties() {
  const { properties, reservations } = useApp();
  const [search, setSearch] = useState("");
  const [pms, setPms] = useState("");
  const navigate = useNavigate();
  const rows = properties.filter(
    (p) =>
      (!pms || p.pmsProvider === pms) &&
      `${p.name} ${p.owner} ${p.externalId}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Properties"
        description="Your property registry and PMS mappings, connected to the financial workspace."
      />
      <div className="filter-toolbar">
        <div className="filter-group">
          <SearchBox
            placeholder="Search property or owner…"
            value={search}
            onChange={setSearch}
          />
          <Select
            label="PMS"
            value={pms}
            onChange={setPms}
            options={[
              { value: "", label: "All PMS" },
              { value: "guesty", label: "Guesty" },
              { value: "guestpro", label: "GuestPro" },
            ]}
          />
        </div>
        <span className="muted subtle">{rows.length} mapped properties</span>
      </div>
      <section className="panel">
        {rows.length ? (
          <div className="table-scroll">
            <table className="property-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>PMS</th>
                  <th>External PMS ID</th>
                  <th>Owner</th>
                  <th className="num">Reservations</th>
                  <th>Sync status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/properties/${p.id}`)}
                  >
                    <td>
                      <Link className="table-title" to={`/properties/${p.id}`}>
                        {p.name}
                      </Link>
                    </td>
                    <td>
                      <PMS provider={p.pmsProvider} />
                    </td>
                    <td className="ref">{p.externalId}</td>
                    <td>{p.owner}</td>
                    <td className="num">
                      {reservations.filter((r) => r.propertyId === p.id).length}
                    </td>
                    <td>
                      <Badge>{p.syncStatus}</Badge>
                    </td>
                    <td>
                      <ChevronRight size={16} />
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
          Properties serve as a registry and mapping layer. Availability,
          inventory and pricing stay in Guesty and GuestPro.
        </p>
      </div>
    </>
  );
}
export function PropertyDetail() {
  const { id } = useParams();
  const { properties, reservations, rules } = useApp();
  const p = properties.find((p) => p.id === id);
  if (!p)
    return (
      <div className="empty">
        <h1>Property not found</h1>
        <Link to="/properties">Return to properties</Link>
      </div>
    );
  const rows = reservations.filter((r) => r.propertyId === id);
  const activeRules = rules.filter((r) => r.propertyId === id && r.enabled);
  return (
    <>
      <Link className="back-link" to="/properties">
        <ArrowLeft size={15} />
        All properties
      </Link>
      <PageHeader
        title={p.name}
        description={`Owner · ${p.owner}`}
        actions={<Badge>{p.syncStatus}</Badge>}
      />
      {p.syncStatus === "Error" && (
        <div className="review-banner">
          <Info size={17} />
          <p>
            Mock mapping issue: this property’s external PMS identifier requires
            review. No real integration is connected.
          </p>
          <Link className="text-link" to="/integrations">
            View integrations
          </Link>
        </div>
      )}
      <section className="panel">
        <div className="panel-heading">
          <h2>Property mapping</h2>
        </div>
        <div className="info-grid">
          <div>
            <dt>PMS platform</dt>
            <dd>
              <PMS provider={p.pmsProvider} />
            </dd>
          </div>
          <div>
            <dt>External PMS ID</dt>
            <dd>{p.externalId}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{p.owner}</dd>
          </div>
          <div>
            <dt>Reservations</dt>
            <dd>{rows.length}</dd>
          </div>
        </div>
      </section>
      <section className="panel spaced-panel">
        <div className="panel-heading">
          <h2>Active commission rules</h2>
          <Link
            className="text-link"
            to={`/financials/commission-rules?property=${p.id}`}
          >
            Manage rules
            <ChevronRight size={15} />
          </Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th className="num">TLT commission</th>
                <th className="num">Agent commission</th>
                <th>Effective period</th>
              </tr>
            </thead>
            <tbody>
              {activeRules.map((r) => (
                <tr key={r.id}>
                  <td>{r.source}</td>
                  <td className="num">{percent(r.tltCommissionRate)}</td>
                  <td className="num">{percent(r.agentCommissionRate)}</td>
                  <td>
                    {date(r.effectiveFrom)} — {date(r.effectiveUntil)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!activeRules.length && (
            <Empty>
              No active rules. Add a commission rule to calculate owner amounts.
            </Empty>
          )}
        </div>
      </section>
      <section className="panel spaced-panel">
        <div className="panel-heading">
          <h2>Reservations</h2>
        </div>
        <ReservationTable rows={rows} />
      </section>
    </>
  );
}
