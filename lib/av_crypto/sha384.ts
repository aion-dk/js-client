import {BitArray, SjclHash} from "./sjcl";
import * as sjcl from "sjcl-with-all";
import jsSHA from 'jssha';

export class SHA384 implements SjclHash {
  private sha: jsSHA;
  constructor() {
    this.sha = new jsSHA("SHA-384", "TEXT", { encoding: "UTF8" });
  }

  finalize(): BitArray {
    const hex = this.sha.getHash("HEX")

    return sjcl.codec.hex.toBits(hex);
  }

  reset(): SjclHash {
    this.sha = new jsSHA('SHA-384', 'TEXT');

    return this;
  }

  update(data: BitArray | string): SjclHash {
    if (typeof data !== "string") {
      data = sjcl.codec.utf8String.fromBits(data) as string
    }
    this.sha.update(data)

    return this;
  }

  static hash(data: BitArray | string): BitArray {
    return new SHA384().update(data).finalize()
  }
}
