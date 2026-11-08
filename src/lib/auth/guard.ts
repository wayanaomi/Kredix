import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import type { UserRole } from "@/lib/enums";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Throws if there is no authenticated user, or if the user's role is not permitted. */
export async function requireUser(allowedRoles?: UserRole[]) {
  const user = await getSessionUser();
  if (!user) throw new AuthError("Authentication required", 401);
  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    throw new AuthError("You do not have permission to perform this action", 403);
  }
  return user;
}

/**
 * Loads a business and verifies the authenticated user owns it.
 * Never trust a client-supplied businessId alone — this re-checks ownership server-side.
 */
export async function requireOwnedBusiness(userId: string, businessId: string) {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business || business.ownerId !== userId) {
    throw new AuthError("Business not found or not owned by this account", 404);
  }
  return business;
}

/** Resolves the Lender record tied to the authenticated lender user — never from client input. */
export async function requireLenderProfile(userId: string) {
  const lender = await prisma.lender.findUnique({ where: { userId } });
  if (!lender) throw new AuthError("No lender profile is linked to this account", 403);
  return lender;
}
