export function formatCategory(category: string) {
  const labels: Record<string, string> = {
    club: 'Kulup',
    manager: 'Teknik direktor',
    national_team: 'Milli takim',
    player: 'Futbolcu',
    stadium: 'Stadyum',
    term: 'Terim',
  };

  return labels[category] ?? category;
}
