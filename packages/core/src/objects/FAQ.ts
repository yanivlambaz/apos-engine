import { Object as AposObject } from "./Object.js";
import type { ObjectInput } from "./Object.js";

/** Generic FAQ knowledge object. */
export class FAQ extends AposObject {
  public static readonly objectType = "faq";

  public constructor(input: ObjectInput) {
    super(FAQ.objectType, input);
  }
}
