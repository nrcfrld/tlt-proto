import { createContext, useContext, useState, type ReactNode } from "react";
import { properties as initialProperties } from "../data/properties";
import { reservations as initialReservations } from "../data/reservations";
import { commissionRules as initialRules } from "../data/commissionRules";
import { additionalServices as initialServices } from "../data/additionalServices";
import { integrations as initialIntegrations } from "../data/integrations";
import { changeReservationCommission } from "../utils/financial";
import { adminRoleId, adminUserId, initialRoles, initialUsers, type AccessModule, type WorkspaceRole, type WorkspaceUser } from "../data/access";
import { createId } from "../utils/id";
import type {
  AdditionalService,
  BoatOnlyOrder,
  CommissionRule,
  CommissionOverride,
  ManualProperty,
  OwnerPayment,
  PMSProvider,
  Property,
  Reservation,
} from "../types";
function useStore() {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [reservations, setReservations] = useState(initialReservations);
  const [rules, setRules] = useState(initialRules);
  const [services, setServices] = useState(initialServices);
  const [boatOnlyOrders, setBoatOnlyOrders] = useState<BoatOnlyOrder[]>([]);
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [users, setUsers] = useState(initialUsers);
  const [roles, setRoles] = useState(initialRoles);
  const [previewUserId, setPreviewUserId] = useState<string>();
  const currentUser = users.find((user) => user.id === (previewUserId ?? adminUserId));
  const currentRole = roles.find((role) => role.id === currentUser?.roleId);
  const canAccess = (module: AccessModule) =>
    Boolean(currentUser?.active && currentRole?.modules.includes(module));
  const [toast, setToast] = useState("");
  const notify = (message: string) => {
    setToast(message);
  };
  return {
    users,
    roles,
    currentUser,
    currentRole,
    previewUserId,
    canAccess,
    startAccessPreview: (id: string) => {
      if (!canAccess("/user-management")) return;
      if (users.some((user) => user.id === id && user.active)) setPreviewUserId(id);
    },
    endAccessPreview: () => setPreviewUserId(undefined),
    saveUser: (user: WorkspaceUser) => {
      if (!canAccess("/user-management") || user.id === adminUserId) return;
      setUsers((items) => items.some((item) => item.id === user.id)
        ? items.map((item) => item.id === user.id ? user : item)
        : [...items, user]);
      notify("User saved.");
    },
    saveRole: (role: WorkspaceRole) => {
      if (!canAccess("/user-management") || role.id === adminRoleId) return;
      setRoles((items) => items.some((item) => item.id === role.id)
        ? items.map((item) => item.id === role.id ? role : item)
        : [...items, role]);
      notify("Role saved.");
    },
    properties,
    reservations,
    reservationMonths: [...new Set(reservations.map((r) => r.checkIn.slice(0, 7)))],
    rules,
    services,
    boatOnlyOrders,
    integrations,
    toast,
    setToast,
    notify,
    addManualProperty: (property: ManualProperty) => {
      setProperties((xs) => [...xs, property]);
      notify("Non-managed property added.");
    },
    addManualReservation: (reservation: Reservation, newProperty?: ManualProperty) => {
      if (newProperty) setProperties((xs) => [...xs, newProperty]);
      setReservations((xs) => [reservation, ...xs]);
      notify("Manual reservation added.");
    },
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
      notify(service.type === "Boat Transfer" ? "Boat order saved." : "Additional service saved.");
    },
    saveBoatOnlyOrder: (order: BoatOnlyOrder) => {
      setBoatOnlyOrders((xs) =>
        xs.some((item) => item.id === order.id)
          ? xs.map((item) => (item.id === order.id ? order : item))
          : [...xs, order],
      );
      notify("Boat order saved.");
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
    saveReservationRemarks: (id: string, remarks: string) => {
      setReservations((xs) =>
        xs.map((r) => (r.id === id ? { ...r, remarks } : r)),
      );
      notify("Reservation remarks saved.");
    },
    saveReservationCommission: (id: string, override: CommissionOverride | undefined, reason: string) => {
      const details = {
        id: createId(),
        changedAt: new Date().toISOString(),
        changedBy: "Enrico (demo)",
        reason,
      };
      setReservations((xs) => xs.map((r) =>
        r.id === id ? changeReservationCommission(r, rules, override, details) : r,
      ));
      notify("Reservation commission saved.");
    },
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
