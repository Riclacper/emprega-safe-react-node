import { apiFetch } from "./api";

export function listReports() {
  return apiFetch("/reports");
}

export function createReport(payload) {
  return apiFetch("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function sendReportEmail(reportId) {
  return apiFetch(`/reports/${reportId}/send-email`, {
    method: "POST",
  });
}
