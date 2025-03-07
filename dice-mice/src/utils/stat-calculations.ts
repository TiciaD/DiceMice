import { Class } from '@/models/class.model';

export const calculateBaseWillpower = (
  stats: Record<string, number>
): number => {
  return Math.max(
    calculateModifier(stats['intelligence']),
    calculateModifier(stats['wisdom']),
    calculateModifier(stats['charisma'])
  );
};

export const calculateModifier = (statValue: number) =>
  Math.floor((statValue - 10) / 2);

export const calculateWillpower = (
  baseWillpower: number,
  classId: string,
  level: number,
  classes: Class[]
) => {
  const classData = classes.find((c) => c.id == classId);

  if (classData) {
    if (classData.willpower_advancement === 'each_level') {
      return baseWillpower + Math.max(0, level - 1); // +1 per level beyond level 1
    }
    if (classData.willpower_advancement === 'even_levels') {
      return baseWillpower + Math.floor(level / 2); // +1 every even level
    }
    return baseWillpower; // No increase
  } else {
    return baseWillpower;
  }
};
