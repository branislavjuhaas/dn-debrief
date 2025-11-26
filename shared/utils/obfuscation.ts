/**
 * Lightweight multiplicative obfuscation helpers used to mask numeric identifiers
 * before transporting them across trust boundaries. This approach offers reversible
 * shuffling via modular arithmetic but is **not** cryptographically secure.
 */
const DEFAULT_PRIME = BigInt("4294967291");
const MULTIPLIER = BigInt("2654435761");
const ZERO = BigInt(0);
const ONE = BigInt(1);

/**
 * Safely coerces a numeric input to bigint while ensuring it represents an integer.
 */
const toBigIntSafe = (value: number | bigint): bigint => {
  if (typeof value === "bigint") return value;
  if (!Number.isInteger(value)) throw new Error("Value must be an integer");
  return BigInt(value);
};

/**
 * Normalizes a bigint into the `[0, prime)` range to keep intermediate values bounded.
 */
const normalize = (value: bigint, prime: bigint): bigint => {
  const result = value % prime;
  return result >= ZERO ? result : result + prime;
};

/**
 * Computes the multiplicative inverse of `value` modulo `prime` using the extended
 * Euclidean algorithm, enabling reversible obfuscation.
 */
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

/**
 * Obfuscates a numeric identifier via Knuth multiplicative hashing in the finite field
 * defined by `prime`. The default prime is a large 32-bit prime close to 2^32.
 *
 * @param x Integer identifier to obfuscate.
 * @param prime Optional custom prime modulus; must be coprime with `MULTIPLIER`.
 * @returns Deterministically permuted integer suitable for lightweight token usage.
 */
export const obfuscate = (
  x: number,
  prime: number = Number(DEFAULT_PRIME),
): number => {
  const bigPrime = toBigIntSafe(prime);
  const bigX = toBigIntSafe(x);
  // Multiply then normalize to remain within the finite field.
  return Number(normalize(bigX * MULTIPLIER, bigPrime));
};

/**
 * Reverses {@link obfuscate} by multiplying with the cached modular inverse.
 *
 * @param y Obfuscated integer returned from {@link obfuscate}.
 * @param prime Optional custom prime modulus matching the obfuscation call.
 * @returns Original integer identifier.
 */
export const deobfuscate = (
  y: number,
  prime: number = Number(DEFAULT_PRIME),
): number => {
  const bigPrime = toBigIntSafe(prime);
  const bigY = toBigIntSafe(y);
  const inverse = getInverse(bigPrime);
  return Number(normalize(bigY * inverse, bigPrime));
};
