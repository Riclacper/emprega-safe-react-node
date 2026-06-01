import { apiFetch } from "./api";

export function listAnalyses() {
  return apiFetch("/analyses");
}

export function createAnalysis(payload) {
  return apiFetch("/analyses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
