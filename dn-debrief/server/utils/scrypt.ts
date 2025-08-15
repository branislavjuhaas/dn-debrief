import { FirebaseScrypt } from "firebase-scrypt";

const config = useRuntimeConfig();

const { signerKey, saltSeparator, rounds, memoryCost } = config.auth;

const hashParameters = {
  memCost: Number(memoryCost),
  rounds: Number(rounds),
  saltSeparator: saltSeparator,
  signerKey: signerKey,
};

const scrypt = new FirebaseScrypt(hashParameters);

export const hashPassword = async (
  password: string,
  salt: string
): Promise<string> => {
  return scrypt.hash(password, salt);
};

export const verifyPassword = async (
  password: string,
  salt: string,
  hash: string
): Promise<boolean> => {
  return scrypt.verify(password, salt, hash);
};
