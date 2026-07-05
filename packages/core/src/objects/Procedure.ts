import { Object as AposObject } from "./Object.js";
import type { ObjectInput } from "./Object.js";

/** Generic procedure knowledge object. */
export class Procedure extends AposObject {
  public static readonly objectType = "procedure";

  public constructor(input: ObjectInput) {
    super(Procedure.objectType, input);
  }
}
