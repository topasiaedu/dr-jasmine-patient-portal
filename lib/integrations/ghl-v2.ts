/**
 * GoHighLevel API v2 — contacts only (no workflows, no outbound messaging).
 * Docs: https://marketplace.gohighlevel.com/docs/
 */

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function authHeaders(): HeadersInit {
  const token = requireEnv("GHL_API_PRIVATE_TOKEN");
  return {
    Authorization: `Bearer ${token}`,
    Version: GHL_API_VERSION,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export interface GhlContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface GhlContactResponse {
  contact?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

/**
 * Fetches a single contact by HighLevel contact id.
 */
export async function ghlGetContact(contactId: string): Promise<GhlContact | null> {
  const res = await fetch(`${GHL_API_BASE}/contacts/${encodeURIComponent(contactId)}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL getContact failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as GhlContactResponse;
  const c = data.contact;
  if (!c?.id) {
    return null;
  }
  return {
    id: c.id,
    firstName: typeof c.firstName === "string" ? c.firstName : "",
    lastName: typeof c.lastName === "string" ? c.lastName : "",
    email: typeof c.email === "string" ? c.email : "",
    phone: typeof c.phone === "string" ? c.phone : "",
  };
}

/**
 * Creates a contact in the configured sub-account (location).
 */
export async function ghlCreateContact(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): Promise<GhlContact> {
  const locationId = requireEnv("GHL_LOCATION_ID");
  const res = await fetch(`${GHL_API_BASE}/contacts/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      locationId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL createContact failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as GhlContactResponse;
  const c = data.contact;
  if (!c?.id) {
    throw new Error("GHL createContact: missing contact id in response");
  }
  return {
    id: c.id,
    firstName: typeof c.firstName === "string" ? c.firstName : input.firstName,
    lastName: typeof c.lastName === "string" ? c.lastName : input.lastName,
    email: typeof c.email === "string" ? c.email : input.email,
    phone: typeof c.phone === "string" ? c.phone : input.phone,
  };
}

interface GhlSearchResponse {
  contacts?: Array<{ id: string; email?: string }>;
}

/**
 * Searches contacts in the location by free-text query (use full email for find-my-link).
 */
export async function ghlSearchContacts(query: string): Promise<string[]> {
  const locationId = requireEnv("GHL_LOCATION_ID");
  const res = await fetch(`${GHL_API_BASE}/contacts/search`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      locationId,
      page: 1,
      pageLimit: 20,
      query,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL searchContacts failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as GhlSearchResponse;
  const list = data.contacts;
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map((c) => c.id).filter((id) => typeof id === "string" && id.length > 0);
}
