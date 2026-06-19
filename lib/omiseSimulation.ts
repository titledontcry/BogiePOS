// In-memory cache for simulated successful payments in test mode.
// This is used to test the checkout flow on localhost.
export const simulatedPaidCharges = new Set<string>()
