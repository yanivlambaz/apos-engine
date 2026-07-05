import { Object as AposObject } from "./Object.js";
import type { ObjectInput } from "./Object.js";

/** Generic guide knowledge object. */
export class Guide extends AposObject {
  public static readonly objectType = "guide";

  public constructor(input: ObjectInput) {
    super(Guide.objectType, input);
  }
}
