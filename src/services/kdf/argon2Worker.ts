import { argon2id } from "hash-wasm";
import type { Argon2idParams } from "@/types/vault";

export interface Argon2WorkerRequest {
  requestId: number;
  password: string;
  salt: Uint8Array;
  params: Argon2idParams;
}

export type Argon2WorkerResponse =
  | { requestId: number; ok: true; key: Uint8Array }
  | { requestId: number; ok: false; error: string };

self.onmessage = async (event: MessageEvent<Argon2WorkerRequest>) => {
  const { requestId, password, salt, params } = event.data;

  try {
    const key = await argon2id({
      password,
      salt,
      memorySize: params.memorySizeKiB,
      iterations: params.iterations,
      parallelism: params.parallelism,
      hashLength: params.hashLength,
      outputType: "binary",
    });

    const response: Argon2WorkerResponse = { requestId, ok: true, key };
    self.postMessage(response, [key.buffer]);
  } catch (error) {
    const response: Argon2WorkerResponse = {
      requestId,
      ok: false,
      error: error instanceof Error ? error.message : "Schlüsselableitung fehlgeschlagen",
    };
    self.postMessage(response);
  }
};
