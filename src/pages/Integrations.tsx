import { RefreshCw, Check, Info, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Badge, Button, PageHeader } from "../components/UI";
export default function Integrations() {
  const { integrations, sync, properties } = useApp();
  return (
    <>
      <PageHeader
        title="Integrations"
        description="Your operational PMS platforms, connected to TLT’s financial workspace."
      />
      <div className="integration-banner">
        <Info size={18} />
        <div>
          <strong>Mock integrations</strong>
          <p>
            Sync is simulated for this prototype. No data is requested from
            Guesty or GuestPro.
          </p>
        </div>
      </div>
      <div className="integration-grid">
        {integrations.map((i) => (
          <section className="panel integration-card" key={i.id}>
            <div className="integration-top">
              <span className={`integration-logo ${i.id}`}>
                {i.id === "guesty" ? "g" : "gp"}
              </span>
              <div>
                <h2>{i.name}</h2>
                <p>Property management system</p>
              </div>
              <Badge>{i.status}</Badge>
            </div>
            <div className="integration-stats">
              <div>
                <span>Connected properties</span>
                <strong>{i.propertyCount}</strong>
              </div>
              <div>
                <span>Last sync</span>
                <strong>{i.lastSync}</strong>
              </div>
            </div>
            <h3>Synced data</h3>
            <div className="sync-data">
              {[
                "Properties",
                "Reservations",
                "Booking sources",
                "Financial data",
              ].map((d) => (
                <div key={d}>
                  <Check size={15} />
                  {d}
                </div>
              ))}
            </div>
            <div className="integration-actions">
              <span>
                {properties.filter((p) => p.pmsProvider === i.id).length}{" "}
                mappings in demo
              </span>
              <Button
                disabled={i.status === "Syncing"}
                onClick={() => {
                  void sync(i.id);
                }}
              >
                <RefreshCw
                  size={15}
                  className={i.status === "Syncing" ? "spinning" : ""}
                />
                {i.status === "Syncing" ? "Syncing…" : "Sync now"}
              </Button>
            </div>
          </section>
        ))}
      </div>
      <section className="panel sync-issue">
        <div>
          <Badge>Error</Badge>
          <h3>Gecko Villa & Bungalows needs mapping review</h3>
          <p>Mock GuestPro property mapping issue · External ID GP-21769</p>
        </div>
        <Link className="text-link" to="/properties/gecko-villa-bungalows">
          Review property
          <ChevronRight size={15} />
        </Link>
      </section>
      <div className="info-note">
        <Info size={16} />
        <p>
          Guesty and GuestPro remain the source of operational reservations. TLT
          adds commission rules, payments, services and financial reporting.
        </p>
      </div>
    </>
  );
}
