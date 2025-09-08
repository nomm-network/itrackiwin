import TipsBody from "../common/TipsBody";

type Props = { category: string; subSlug: string };

export default function ConfigureBody({ category, subSlug }: Props) {
  return <TipsBody category={category} subSlug={subSlug} />;
}