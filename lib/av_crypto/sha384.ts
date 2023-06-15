import {BitArray, SjclHash} from "./sjcl";
import * as sjcl from "sjcl-with-all";
import {sha384, SHA512} from '@noble/hashes/sha512';
import {Hash} from "@noble/hashes/utils";

export class SHA384 implements SjclHash {
  private sha: Hash<SHA512>;
  constructor() {
    this.sha = sha384.create()
  }

  finalize(): BitArray {
    const digest = this.sha.digest()

    return sjcl.codec.bytes.toBits(digest)
  }

  reset(): SjclHash {
    this.sha = sha384.create();

    return this;
  }

  update(data: BitArray | string): SjclHash {
    if (typeof data === "string") {
      this.sha.update(data)
    } else {
      const byteArray = new Uint8Array(sjcl.codec.bytes.fromBits(data))
      this.sha.update(byteArray)
    }

    return this;
  }

  static hash(data: BitArray | string): BitArray {
    return new SHA384().update(data).finalize()
  }
}
