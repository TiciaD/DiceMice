export const roll3d6 = (): number => {
  return (
    Math.floor(Math.random() * 6) +
    1 +
    Math.floor(Math.random() * 6) +
    1 +
    Math.floor(Math.random() * 6) +
    1
  );
};

export const roll4d6DropLowest = (): number => {
  const rolls = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
  console.log('4d6 rolls', rolls);
  rolls.sort((a, b) => a - b); // Sort in ascending order
  rolls.shift(); // Remove the lowest roll
  return rolls.reduce((a, b) => a + b, 0); // Sum remaining three
};

// Calculate roll for 1d{number} die rolls
export const rollDie = (die: string): number => {
  const sides = parseInt(die.replace('1d', ''), 10);
  return Math.floor(Math.random() * sides) + 1;
};
