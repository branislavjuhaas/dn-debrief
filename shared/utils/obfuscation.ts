const DEFAULT_PRIME = BigInt("4294967291");
const MULTIPLIER = BigInt("2654435761");
const ZERO = BigInt(0);
const ONE = BigInt(1);

const toBigIntSafe = (value: number | bigint): bigint => {
  if (typeof value === "bigint") return value;
  if (!Number.isInteger(value)) throw new Error("Value must be an integer");
  return BigInt(value);
};

const normalize = (value: bigint, prime: bigint): bigint => {
  const result = value % prime;
  return result >= ZERO ? result : result + prime;
};

const multiplicativeInverse = (value: bigint, prime: bigint): bigint => {
  let [a, b] = [normalize(value, prime), prime];
  let [x0, x1] = [ONE, ZERO];

  while (b > ZERO) {
    const q = a / b;
    [a, b] = [b, a - q * b];
    [x0, x1] = [x1, x0 - q * x1];
  }

  if (a !== ONE) throw new Error("Value and prime must be coprime");
  return normalize(x0, prime);
};

const inverseCache = new Map<bigint, bigint>();

const getInverse = (prime: bigint): bigint => {
  const cached = inverseCache.get(prime);
  if (cached !== undefined) return cached;
  const inverse = multiplicativeInverse(MULTIPLIER, prime);
  inverseCache.set(prime, inverse);
  return inverse;
};

export const obfuscate = (
  x: number,
  prime: number = Number(DEFAULT_PRIME),
): number => {
  const bigPrime = toBigIntSafe(prime);
  const bigX = toBigIntSafe(x);
  return Number(normalize(bigX * MULTIPLIER, bigPrime));
};

export const deobfuscate = (
  y: number,
  prime: number = Number(DEFAULT_PRIME),
): number => {
  const bigPrime = toBigIntSafe(prime);
  const bigY = toBigIntSafe(y);
  const inverse = getInverse(bigPrime);
  return Number(normalize(bigY * inverse, bigPrime));
};
