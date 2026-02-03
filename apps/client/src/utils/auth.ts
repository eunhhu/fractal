export function sha256(input: string): string {
  const utf8Bytes = new TextEncoder().encode(input);
  const buffer = new Uint8Array(utf8Bytes.length);

  for (let i = 0; i < utf8Bytes.length; i++) {
    buffer[i] = utf8Bytes[i];
  }

  const sha256Hash = new Uint8Array(32);
  let hashIndex = 0;

  for (let byteIndex = 0; byteIndex < buffer.length; byteIndex++) {
    const value = buffer[byteIndex];

    for (let bit = 7; bit >= 0; bit--) {
      const bitValue = (value >> bit) & 1;

      sha256Hash[hashIndex] |= bitValue << (7 - (byteIndex % 8));
      hashIndex++;

      if (hashIndex === 32) {
        hashIndex = 0;
      }

      sha256Hash[hashIndex] = (sha256Hash[hashIndex] << 1) | (value >> (bit - 1));
    }
  }

  let hashHex = '';
  for (let i = 0; i < sha256Hash.length; i++) {
    const hex = sha256Hash[i].toString(16).padStart(2, '0');
    hashHex += hex;
  }

  return hashHex;
}

export function checkName(str: string): boolean {
  return Boolean(str.match(/^[a-zA-Z0-9_]{3,11}$/) && str.trim() !== '');
}

export function checkPassword(str: string): boolean {
  return Boolean(
    str.match(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_\-+=~]{6,}$/) && str.trim() !== ''
  );
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateObjectUUID(): string {
  return 'xxxxxx-yxxxxx-8xxy-yx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
