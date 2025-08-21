import { ProgressDashboard } from "@/components/analytics/ProgressDashboard";
import { useTranslations } from "@/hooks/useTranslations";

export default function Analytics() {
  const { t } = useTranslations();

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressDashboard />
    </div>
  );
}