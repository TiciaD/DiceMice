import { AllowedStats, BaseStatMap, Character } from '@/models/character.model';
import { Class } from '@/models/class.model';
import { DerivedStat } from '@/models/derived-stat.model';
import { InitiativeEntry } from '@/models/initiative-entry.model';
import { Stat } from '@/models/stat.model';
import { evaluate } from 'mathjs';

export const calculateBaseWillpower = (stats: BaseStatMap): number => {
  return Math.max(
    calculateModifier(stats.intelligence),
    calculateModifier(stats.wisdom),
    calculateModifier(stats.charisma)
  );
};

export const calculateModifier = (statValue: number) =>
  Math.floor((statValue - 10) / 2);

export const calculateRetainerModifier = (statValue: number) =>
  statValue >= 12 ? 1 : 0;

export const calculateWillpower = (
  baseWillpower: number,
  classId: string,
  level: number,
  classes: Class[]
) => {
  const classData = classes.find((c) => c.id == classId);

  if (classData) {
    if (classData.willpower_advancement === 'each_level') {
      return baseWillpower + Math.max(0, level); // +1 per level beyond level 1
    }
    if (classData.willpower_advancement === 'even_levels') {
      return baseWillpower + Math.floor(level / 2); // +1 every even level
    }
    return baseWillpower; // No increase
  } else {
    return baseWillpower;
  }
};

export const getInitiative = (
  initiativeChart: InitiativeEntry[],
  baseStats: BaseStatMap
) => {
  if (initiativeChart.length > 0) {
    const dexModifier = calculateModifier(baseStats['dexterity']);
    const entry = initiativeChart.find((e) => e.modifier === dexModifier);
    if (entry) {
      return `${entry.diceRolled} ${dexModifier > 0 ? '+' : ''}${
        dexModifier ? dexModifier : ''
      }`;
    } else {
      return 'Unknown';
    }
  }
};

export const getNonCalculatedStatValue = (
  derivedStat: DerivedStat,
  cls: Class,
  level: number
) => {
  const classStatValues = cls.baseValues[level];
  return classStatValues[derivedStat.id] || 0;
};

export const getDerivedStatValue = (
  stats: Stat[],
  derivedStat: DerivedStat,
  currentClass: Class,
  character: Character
) => {
  // Prepare variable values
  let statFormula = derivedStat.formula; // Default formula
  let statVariables = [...derivedStat.variables]; // Default variables
  const variables: Record<string, number> = {};

  if (currentClass?.baseValues) {
    // Check if this class has an overriding ability for this stat
    const applicableOverride = derivedStat.overrides?.find(
      (override) =>
        override.classId === currentClass.id &&
        character.level >= override.minLevel && // Ensure character is at or above required level
        currentClass.abilities.some(
          (ability) => ability.name === override.abilityName
        )
    );

    if (applicableOverride) {
      // Override formula and variables if present
      if (applicableOverride.newFormula)
        statFormula = applicableOverride.newFormula;
      if (applicableOverride.newVariables)
        statVariables = applicableOverride.newVariables;
    }

    statVariables.forEach((variable) => {
      const levelOneClassStatValues = currentClass.baseValues[character.level];
      if (variable == 'base') {
        variables['base'] =
          Number(levelOneClassStatValues[derivedStat.id]) || 0;
      } else {
        const matchingStat = stats.find((stat) => {
          return (
            variable.replace('_mod', '').toUpperCase() == stat.abbreviation
          );
        });

        variables[variable] = matchingStat
          ? calculateModifier(
              character.current_base_stats[matchingStat.id as AllowedStats]
            )
          : 0;
      }
    });

    return evaluateFormula(statFormula, variables);
  } else {
    return 0;
  }
};

const evaluateFormula = (formula: string, values: Record<string, number>) => {
  return evaluate(formula, values);
};
