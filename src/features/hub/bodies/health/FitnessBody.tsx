// ⚠️ DO NOT alter visuals here. This only wraps the frozen legacy components.
import FitnessLegacyBody from "@/features/health/fitness/legacy/old-FitnessLegacyBody";

type Props = { category: string; subSlug: string };

export default function FitnessBody({ category, subSlug }: Props) {
  return <FitnessLegacyBody />;
}