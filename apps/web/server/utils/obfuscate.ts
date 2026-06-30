// A random 32-bit number of your choice to scramble the ID
const MASK = 123456789;

export const obfuscateId = (id: number): string => {
  // XOR the ID with the mask, then convert to a hex string
  return (id ^ MASK).toString(16);
};

export const deobfuscateId = (hex: string): number => {
  // Convert hex back to a number, then XOR it again to reverse it
  return parseInt(hex, 16) ^ MASK;
};
