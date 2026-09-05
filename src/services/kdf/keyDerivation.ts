import type { Argon2idParams } from "@/types/vault";
import type { Argon2WorkerRequest, Argon2WorkerResponse } from "./argon2Worker";

export const ARGON2ID_PARAMS: Argon2idParams = {
  memorySizeKiB: 65536,
  iterations: 3,
  parallelism: 1,
  hashLength: 32,
};

type PendingResolver = {
  resolve: (key: Uint8Array) => void;
  reject: (error: Error) => void;
};

let worker: Worker | null = null;
let nextRequestId = 0;
const pending = new Map<number, PendingResolver>();

function getWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(new URL("./argon2Worker.ts", import.meta.url), {
    type: "module",
  });

  worker.onmessage = (event: MessageEvent<Argon2WorkerResponse>) => {
    const message = event.data;
    const resolver = pending.get(message.requestId);
    if (!resolver) return;
    pending.delete(message.requestId);

    if (message.ok === true) {
      resolver.resolve(message.key);
    } else {
      resolver.reject(new Error(message.error));
    }

  };

  worker.onerror = () => {
    pending.forEach((resolver) =>
      resolver.reject(new Error("Schlüsselableitung fehlgeschlagen."))
    );
    pending.clear();
  };

  return worker;
}

function deriveRawKey(
  password: string,
  salt: Uint8Array,
  params: Argon2idParams
): Promise<Uint8Array> {
  const requestId = nextRequestId++;
  const request: Argon2WorkerRequest = { requestId, password, salt, params };

  return new Promise<Uint8Array>((resolve, reject) => {
    pending.set(requestId, { resolve, reject });
    getWorker().postMessage(request);
  });
}

/**
 * Leitet den AES-256-GCM-Schlüssel mit Argon2id ab.
 * Die speicherintensive Berechnung läuft im Worker, der Schlüssel selbst
 * wird im Hauptthread als nicht-extrahierbarer CryptoKey importiert.
 */
export async function deriveVaultKey(
  password: string,
  salt: Uint8Array,
  params: Argon2idParams = ARGON2ID_PARAMS
): Promise<CryptoKey> {
  const rawKey = await deriveRawKey(password, salt, params);

  const key = await crypto.subtle.importKey(
    "raw",
    rawKey as BufferSource,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  rawKey.fill(0);
  return key;
}
