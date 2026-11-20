export const accessModules = {
  "/": "Dashboard",
  "/reservations": "Reservations",
  "/properties": "Properties",
  "/boat-orders": "Boat",
  "/financials/commission-rules": "Commission rules",
  "/financials/owner-payments": "Owner payments",
  "/additional-services": "Additional services",
  "/reports": "Reports",
  "/integrations": "Integrations",
  "/settings": "Settings",
  "/user-management": "User Management",
} as const;

export type AccessModule = keyof typeof accessModules;
export const modules = Object.keys(accessModules) as AccessModule[];

export type WorkspaceRole = {
  id: string;
  name: string;
  modules: AccessModule[];
};

export type WorkspaceUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  active: boolean;
};

export const adminUserId = "workspace-admin";
export const adminRoleId = "admin";

export const initialRoles: WorkspaceRole[] = [
  { id: adminRoleId, name: "Admin", modules },
  {
    id: "finance",
    name: "Finance",
    modules: ["/", "/reservations", "/properties", "/financials/commission-rules", "/financials/owner-payments", "/reports"],
  },
  {
    id: "operations",
    name: "Operations",
    modules: ["/reservations", "/properties", "/boat-orders", "/additional-services"],
  },
];

export const initialUsers: WorkspaceUser[] = [
  { id: adminUserId, name: "Enrico", email: "enrico@example.test", roleId: adminRoleId, active: true },
  { id: "demo-finance", name: "Finance Demo", email: "finance@example.test", roleId: "finance", active: true },
  { id: "demo-operations", name: "Operations Demo", email: "operations@example.test", roleId: "operations", active: true },
];
