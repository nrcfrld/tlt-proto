import { createContext, useContext, useState, type ReactNode } from "react";
import { properties } from "../data/properties";
import { reservations as initialReservations } from "../data/reservations";
import { commissionRules as initialRules } from "../data/commissionRules";
import { additionalServices as initialServices } from "../data/additionalServices";
import { integrations as initialIntegrations } from "../data/integrations";
import type {
  AdditionalService,
  CommissionRule,
  OwnerPayment,
  PMSProvider,
  Reservation,
} from "../types";
function useStore() {
  const [reservations, setReservations] = useState(initialReservations);
  const [rules, setRules] = useState(initialRules);
  const [services, setServices] = useState(initialServices);
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [toast, setToast] = useState("");
  const notify = (message: string) => {
    setToast(message);
  };
  return {
    properties,
    reservations,
    rules,
    services,
    integrations,
    toast,
    setToast,
    notify,
    saveRule: (rule: CommissionRule) => {
      setRules((xs) =>
        xs.some((r) => r.id === rule.id)
          ? xs.map((r) => (r.id === rule.id ? rule : r))
          : [...xs, rule],
      );
      notify("Commission rule saved. Financial totals updated.");
    },
    toggleRule: (id: string) => {
      setRules((xs) =>
        xs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
      );
      notify("Commission rule updated.");
    },
    recordOwnerPayment: (id: string, payment: OwnerPayment) => {
      setReservations((xs) =>
        xs.map((r) =>
          r.id === id
            ? { ...r, ownerPayments: [...r.ownerPayments, payment] }
            : r,
        ),
      );
      notify("Owner payment recorded. Settlement updated.");
    },
    markGuestPaid: (id: string, paymentId: string, paidAt: string) => {
      setReservations((xs) =>
        xs.map((r) =>
          r.id === id
            ? {
                ...r,
                guestPayments: r.guestPayments.map((p) =>
                  p.id === paymentId ? { ...p, paidAt } : p,
                ),
              }
            : r,
        ),
      );
      notify("Guest payment marked as paid.");
    },
    saveService: (service: AdditionalService) => {
      setServices((xs) =>
        xs.some((s) => s.id === service.id)
          ? xs.map((s) => (s.id === service.id ? service : s))
          : [...xs, service],
      );
      notify("Additional service saved.");
    },
    sync: async (id: PMSProvider) => {
      setIntegrations((xs) =>
        xs.map((x) => (x.id === id ? { ...x, status: "Syncing" } : x)),
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIntegrations((xs) =>
        xs.map((x) =>
          x.id === id ? { ...x, status: "Connected", lastSync: "just now" } : x,
        ),
      );
      notify("Mock sync complete. Last synced just now.");
    },
    updateReservation: (reservation: Reservation) =>
      setReservations((xs) =>
        xs.map((r) => (r.id === reservation.id ? reservation : r)),
      ),
  };
}
type Store = ReturnType<typeof useStore>;
const AppContext = createContext<Store | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}
export function useApp() {
  const store = useContext(AppContext);
  if (!store) throw new Error("AppProvider required");
  return store;
}
