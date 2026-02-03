export function getExp(lvl: number): number {
  return 100 + lvl ** 2 * 10;
}

export function getTotalExp(lvl: number): number {
  if (lvl <= 0) return 0;
  if (lvl === 1) return 110;
  return 100 + lvl ** 2 * 10 + getTotalExp(lvl - 1);
}

export function getTotalClanExp(lvl: number): number {
  if (lvl <= 0) return 0;
  if (lvl === 1) return 1100;
  return 1000 + lvl ** 2 * 100 + getTotalClanExp(lvl - 1);
}

export function getLvl(exp: number): number {
  let lvl = 1;
  while (exp >= getExp(lvl)) {
    exp -= getExp(lvl);
    lvl++;
  }
  return lvl;
}

export function getClanLvl(exp: number): number {
  let lvl = 0;
  while (exp >= getTotalClanExp(lvl)) {
    exp -= getTotalClanExp(lvl);
    lvl++;
  }
  return lvl;
}
