import type { AppUser, Role } from "@/types";
import { ApiError, request } from "./api";

/** Mock accounts. Replace with POST /auth/login against the real identity service. */
const ACCOUNTS: (AppUser & { password: string })[] = [
  { id: "USR-001", name: "Mahmudul Karim", nameBn: "মাহমুদুল করিম", role: "super_admin", phone: "+8801711000001", email: "superadmin@bashundhara-ra.test", block: "Block A", avatarInitials: "MK", password: "demo1234" },
  { id: "USR-002", name: "Farhana Chowdhury", nameBn: "ফারহানা চৌধুরী", role: "community_admin", phone: "+8801711000002", email: "admin@bashundhara-ra.test", block: "Block C", avatarInitials: "FC", password: "demo1234" },
  { id: "USR-003", name: "Zahid Hossain", nameBn: "জাহিদ হোসেন", role: "security_admin", phone: "+8801711000003", email: "security@bashundhara-ra.test", block: "Block D", avatarInitials: "ZH", password: "demo1234" },
  { id: "USR-004", name: "Rakib Sarker", nameBn: "রাকিব সরকার", role: "security_officer", phone: "+8801711000004", email: "gate2@bashundhara-ra.test", block: "Gate 2", avatarInitials: "RS", password: "demo1234" },
  { id: "USR-005", name: "Sabrina Islam", nameBn: "সাবরিনা ইসলাম", role: "property_manager", phone: "+8801711000005", email: "property@bashundhara-ra.test", block: "Block B", avatarInitials: "SI", password: "demo1234" },
  { id: "USR-006", name: "Imran Bhuiyan", nameBn: "ইমরান ভূঁইয়া", role: "maintenance_manager", phone: "+8801711000006", email: "maintenance@bashundhara-ra.test", block: "Block E", avatarInitials: "IB", password: "demo1234" },
  { id: "USR-007", name: "Tasnim Ahmed", nameBn: "তাসনিম আহমেদ", role: "finance_manager", phone: "+8801711000007", email: "finance@bashundhara-ra.test", block: "Block A", avatarInitials: "TA", password: "demo1234" },
  { id: "USR-008", name: "Nusrat Jahan", nameBn: "নুসরাত জাহান", role: "resident", phone: "+8801711000008", email: "resident@bashundhara-ra.test", block: "Block C", propertyId: "PRP-0007", avatarInitials: "NJ", password: "demo1234" },
  { id: "USR-010", name: "Mahbub Alam", nameBn: "মাহবুব আলম", role: "building_owner", phone: "+8801711000010", email: "buildingowner@bashundhara-ra.test", block: "Block F", avatarInitials: "MA", password: "demo1234" },
  { id: "USR-011", name: "Shirin Sultana", nameBn: "শিরিন সুলতানা", role: "building_manager", phone: "+8801711000011", email: "buildingmanager@bashundhara-ra.test", block: "Block F", avatarInitials: "SS", password: "demo1234" },
  { id: "USR-012", name: "Jamal Uddin", nameBn: "জামাল উদ্দিন", role: "caretaker", phone: "+8801711000012", email: "caretaker@bashundhara-ra.test", block: "Block C", avatarInitials: "JU", password: "demo1234" },
  { id: "USR-013", name: "Golam Rabbani", nameBn: "গোলাম রব্বানী", role: "welfare_admin", phone: "+8801711000013", email: "welfare@bashundhara-ra.test", block: "Block A", avatarInitials: "GR", password: "demo1234" },
  { id: "USR-014", name: "Ayesha Siddiqua", nameBn: "আয়েশা সিদ্দিকা", role: "accountant", phone: "+8801711000014", email: "accounts@bashundhara-ra.test", block: "Block B", avatarInitials: "AS", password: "demo1234" },
  { id: "USR-015", name: "Clean & Fresh Laundry", nameBn: "ক্লিন অ্যান্ড ফ্রেশ", role: "service_provider", phone: "+8801711000015", email: "provider@bashundhara-ra.test", block: "Block D", avatarInitials: "CF", password: "demo1234" },
  { id: "USR-009", name: "Meghna Builders Ltd.", nameBn: "মেঘনা বিল্ডার্স", role: "contractor", phone: "+8801711000009", email: "contractor@bashundhara-ra.test", block: "Block J", avatarInitials: "MB", password: "demo1234" },
];

export const DEMO_ACCOUNTS = ACCOUNTS.map(({ password: _pw, ...rest }) => rest);

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  community_admin: "Community Admin",
  security_admin: "Security Admin",
  security_officer: "Security Officer",
  property_manager: "Property Manager",
  maintenance_manager: "Maintenance Manager",
  finance_manager: "Finance Manager",
  resident: "Resident",
  contractor: "Contractor",
  welfare_admin: "Welfare Society Admin",
  building_owner: "Building Owner",
  building_manager: "Building Manager",
  accountant: "Accountant",
  caretaker: "Caretaker",
  maintenance_staff: "Maintenance Staff",
  service_provider: "Service Provider",
  tenant: "Tenant",
};

const STORAGE_KEY = "bra.session";

export const authService = {
  async login(identifier: string, password: string): Promise<AppUser> {
    const found = ACCOUNTS.find(
      (a) => a.email.toLowerCase() === identifier.trim().toLowerCase() || a.phone === identifier.trim(),
    );
    if (!found) throw new ApiError(404, "No account found for this phone or email.");
    if (found.password !== password) throw new ApiError(401, "Incorrect password. Please try again.");
    const { password: _pw, ...user } = found;
    return request("/auth/login", user, 500);
  },
  loginAs(role: Role): Promise<AppUser> {
    const found = ACCOUNTS.find((a) => a.role === role)!;
    const { password: _pw, ...user } = found;
    return request("/auth/login", user, 300);
  },
  /** Placeholder — real OTP delivery is handled by the backend SMS provider. */
  requestOtp: (phone: string) => request("/auth/otp", { phone, sent: true, ttl: 120 }, 600),
  verifyOtp: (phone: string, code: string) => {
    if (code.length !== 6) throw new ApiError(422, "Enter the 6-digit code sent to your phone.");
    return request("/auth/otp/verify", { phone, verified: true }, 400);
  },
  resetPassword: (identifier: string) => request("/auth/reset", { identifier, sent: true }, 500),
  logout: () => request("/auth/logout", { ok: true }, 150),
  restore(): AppUser | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { user: AppUser; storedAt: number };
      // 7 days expiration check
      const MAX_AGE = 7 * 86400 * 1000;
      if (parsed.storedAt && Date.now() - parsed.storedAt > MAX_AGE) {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed.user ?? (parsed as unknown as AppUser);
    } catch {
      return null;
    }
  },
  persist(user: AppUser | null) {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, storedAt: Date.now() }));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },
};