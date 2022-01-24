import * as sjcl from "../sjcl";

// As this is working with untyped SJCL classes,
// we need the _any_ type in this wrapper.

/*eslint-disable @typescript-eslint/no-explicit-any*/

export default class Bignum {
  private bn: any;

  constructor(data: any) {
    this.bn = new sjcl.bn(data);
  }

  isEven = () => this.bn.limbs[0] % 2 === 0;
  equals = (other: Bignum): boolean => !!this.bn.equals(other.bn);

  mod = (operand: Bignum): Bignum => new Bignum(this.bn.mod(operand.bn));
  add = (operand: Bignum): Bignum => new Bignum(this.bn.add(operand.bn))

  toBits = () => this.bn.toBits();
  toBn = () => this.bn;
}
