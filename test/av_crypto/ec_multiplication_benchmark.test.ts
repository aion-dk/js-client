import {BigNumber, SjclEllipticalPoint} from "../../lib/av_crypto/sjcl";
import {hashIntoPoint, hashIntoScalar, infinityPoint, pointEquals, pointToHex} from "../../lib/av_crypto/utils";
import {expect} from "chai";
import {Curve} from "../../lib/av_crypto/curve";
import * as sjcl from "sjcl-with-all";

describe.skip("benchmarking point multiplication", ()=> {
  const curve = new Curve('k256');
  function naiveMultiplicationTechnic(scalars: BigNumber[], points: SjclEllipticalPoint[]): SjclEllipticalPoint {
    let result = infinityPoint(curve);
    for (let i = 0; i < scalars.length; i++) {
      result = result.toJac().add(points[i].mult(scalars[i])).toAffine()
    }

    return result
  }

  function jacobianAdditionTechnic(scalars: BigNumber[], points: SjclEllipticalPoint[]): SjclEllipticalPoint {
    let result = infinityPoint(curve).toJac();
    for (let i= 0; i < points.length; i++) {
      const pointAffine = points[i].mult(scalars[i])
      result = result.add(pointAffine)
    }

    return result.toAffine()
  }

  function jacobianMultiplicationTechnic(scalars: BigNumber[], points: SjclEllipticalPoint[]): SjclEllipticalPoint {
    let result = infinityPoint(curve).toJac();
    for (let i= 0; i < points.length; i++) {
      const pointAffine = points[i].toJac().mult(scalars[i], points[i]).toAffine()
      result = result.add(pointAffine)
    }

    return result.toAffine()
  }

  function ellipticalMultiplication2Technic(scalars: BigNumber[], points: SjclEllipticalPoint[]): SjclEllipticalPoint {
    let result = infinityPoint(curve).toJac();
    for (let i= 0; i < points.length; i = i + 2) {
      const pointAffine = points[i].mult2(scalars[i], scalars[i+1], points[i+1])
      result = result.add(pointAffine)
    }

    return result.toAffine()
  }

  function ellipticalMultiplication2OnlyTechnic(scalars: BigNumber[], points: SjclEllipticalPoint[]): SjclEllipticalPoint {
    let result = infinityPoint(curve);
    for (let i= 0; i < points.length; i++) {
      result = result.mult2(new sjcl.bn(1), scalars[i], points[i])
    }

    return result
  }

  function jacobianMultiplication2Technic(scalars: BigNumber[], points: SjclEllipticalPoint[]): SjclEllipticalPoint {
    let result = infinityPoint(curve).toJac();
    for (let i= 0; i < points.length; i++) {
      result = result.mult2(new sjcl.bn(1), result.toAffine(), scalars[i], points[i])
    }

    return result.toAffine()
  }



  function customGeneralizedMultiplicationTechnic(scalars: BigNumber[], points: SjclEllipticalPoint[]): SjclEllipticalPoint {
    // implementation of `mult2` copied from sjcl.js
    // if (typeof(k1) === "number") {
    //   k1 = [k1];
    // } else if (k1.limbs !== undefined) {
    //   k1 = k1.normalize().limbs;
    // }
    //
    // if (typeof(k2) === "number") {
    //   k2 = [k2];
    // } else if (k2.limbs !== undefined) {
    //   k2 = k2.normalize().limbs;
    // }
    //
    // var i, j, out = new sjcl.ecc.point(this.curve).toJac(), m1 = affine.multiples(),
    //   m2 = affine2.multiples(), l1, l2;
    //
    // for (i=Math.max(k1.length,k2.length)-1; i>=0; i--) {
    //   l1 = k1[i] | 0;
    //   l2 = k2[i] | 0;
    //   for (j=sjcl.bn.prototype.radix-4; j>=0; j-=4) {
    //     out = out.doubl().doubl().doubl().doubl().add(m1[l1>>j & 0xF]).add(m2[l2>>j & 0xF]);
    //   }
    // }
    //
    // return out;



    // my trial at generalizing the code above:

    // for some reason, 256 bit big numbers have 11 limbs
    // unfortunately, typescript sjcl does not provide a way to access limbs directly
    // const maxLimbsCount = 11

    // after some investigation, we figured out limbs count is dependent on bit length of the number
    // and the hardcoded `radix`
    const maxLimbsCount = Math.max(...scalars.map((s) => Math.ceil(s.bitLength() / sjcl.bn.prototype.radix)))
    const multiples = points.map((p) => p.multiples())
    let result = infinityPoint(curve).toJac();
    for (let i= maxLimbsCount - 1; i >= 0; i--) {
      for (let j= sjcl.bn.prototype.radix - 4; j >= 0; j -= 4) {
        result = result.doubl().doubl().doubl().doubl()

        for (let k = 0; k < scalars.length; k++) {
          const limb = scalars[k].getLimb(i)

          result = result.add(multiples[k][limb >> j & 0xF])
        }
      }
    }

    return result.toAffine()
  }


  const n = 1_000
  it("records how long it takes", () => {
    const scalars: BigNumber[] = []
    const points: SjclEllipticalPoint[] = []
    for (let i = 0; i < n; i ++) {
      scalars.push(hashIntoScalar(i.toString(), curve))
      points.push(hashIntoPoint(i.toString(), curve))
    }



    // Naive multiplication
    // ##################################################
    // warm-up
    for (let i=0; i<3; i++) {
      naiveMultiplicationTechnic(scalars, points)
    }
    console.time("naive")
    const resultNaive = naiveMultiplicationTechnic(scalars, points)
    console.timeLog("naive")



    // Jacobian addition
    // ##################################################
    // warm-up
    for (let i=0; i<3; i++) {
      jacobianAdditionTechnic(scalars, points)
    }
    console.time("jacobian add")
    const resultJacobianAddition = jacobianAdditionTechnic(scalars, points)
    console.timeLog("jacobian add")



    // Jacobian multiplication
    // ##################################################
    // warm-up
    for (let i=0; i<3; i++) {
      jacobianMultiplicationTechnic(scalars, points)
    }
    console.time("jacobian mult")
    const resultJacobianMultiplication = jacobianMultiplicationTechnic(scalars, points)
    console.timeLog("jacobian mult")



    // Elliptical multiplication 2
    // ##################################################
    // warm-up
    for (let i=0; i<3; i++) {
      ellipticalMultiplication2Technic(scalars, points)
    }
    console.time("elliptical mult2")
    const resultEllipticalMultiplication2 = ellipticalMultiplication2Technic(scalars, points)
    console.timeLog("elliptical mult2")



    // Elliptical multiplication 2 only
    // ##################################################
    // warm-up
    for (let i=0; i<3; i++) {
      ellipticalMultiplication2OnlyTechnic(scalars, points)
    }
    console.time("elliptical mult2 no addition")
    const resultEllipticalMultiplication2Only = ellipticalMultiplication2OnlyTechnic(scalars, points)
    console.timeLog("elliptical mult2 no addition")



    // Jacobian multiplication 2
    // ##################################################
    // warm-up
    for (let i=0; i<3; i++) {
      jacobianMultiplication2Technic(scalars, points)
    }
    console.time("jacobian mult2")
    const resultJacobianMultiplication2 = jacobianMultiplication2Technic(scalars, points)
    console.timeLog("jacobian mult2")



    // custom generalized multiplication
    // ##################################################
    // warm-up
    for (let i=0; i<3; i++) {
      customGeneralizedMultiplicationTechnic(scalars, points)
    }
    console.time("custom generalized multiplication")
    const resultCustomGeneralizedMultiplication = customGeneralizedMultiplicationTechnic(scalars, points)
    console.timeLog("custom generalized multiplication")



    console.log("result is: " + pointToHex(resultNaive))
    console.log("result is: " + pointToHex(resultJacobianAddition))
    console.log("result is: " + pointToHex(resultJacobianMultiplication))
    console.log("result is: " + pointToHex(resultEllipticalMultiplication2))
    console.log("result is: " + pointToHex(resultEllipticalMultiplication2Only))
    console.log("result is: " + pointToHex(resultJacobianMultiplication2))
    console.log("result is: " + pointToHex(resultCustomGeneralizedMultiplication))

    expect(pointEquals(resultNaive, resultJacobianAddition)).to.be.true
    expect(pointEquals(resultNaive, resultJacobianMultiplication)).to.be.true
    expect(pointEquals(resultNaive, resultEllipticalMultiplication2)).to.be.true
    expect(pointEquals(resultNaive, resultEllipticalMultiplication2Only)).to.be.true
    expect(pointEquals(resultNaive, resultJacobianMultiplication2)).to.be.true
    expect(pointEquals(resultNaive, resultCustomGeneralizedMultiplication)).to.be.true
  })
})
