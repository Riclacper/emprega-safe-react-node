import { badgeClass } from "../utils/riskUtils";

export default function RiskBadge({ badge, children }) {
  return <span className={badgeClass(badge)}>{children}</span>;
}
