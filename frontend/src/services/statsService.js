import { apiFetch } from "./api";

export function getStats() {
  return apiFetch("/stats");
}
