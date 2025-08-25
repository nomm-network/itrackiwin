export function getExerciseDisplayName(wex: any, locale = 'en') {
  return (
    wex?.exercise?.translations?.[locale]?.name ||
    wex?.exercise?.name ||
    `Exercise ${wex?.order_index ?? ''}`.trim()
  );
}