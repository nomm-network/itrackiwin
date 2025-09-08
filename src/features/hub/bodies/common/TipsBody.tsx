type Props = { category: string; subSlug: string };

export default function TipsBody({ category, subSlug }: Props) {
  return (
    <div className="rounded-xl border p-4">
      <h2 className="text-2xl font-semibold mb-1">
        {category} • {subSlug}
      </h2>
      <p className="text-muted-foreground mb-3">
        This module is under construction. Here are 10 best-practice tips to get
        value right away.
      </p>
      <ol className="list-decimal pl-5 space-y-1">
        <li>Keep it simple and consistent.</li>
        <li>Track small, repeatable habits first.</li>
        <li>Review weekly trends, not single days.</li>
        <li>Automate anything you can.</li>
        <li>Use tags to find patterns fast.</li>
        <li>Celebrate streaks and quick wins.</li>
        <li>Reduce friction: 10-second rule.</li>
        <li>Share goals with an accountability buddy.</li>
        <li>Iterate in tiny steps (1 change/week).</li>
        <li>When stuck, remove—not add—habits.</li>
      </ol>
    </div>
  );
}