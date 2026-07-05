import { Object as AposObject } from "./Object.js";
import type { ObjectInput } from "./Object.js";

/** Generic service knowledge object. */
export class Service extends AposObject {
  public static readonly objectType = "service";

  public constructor(input: ObjectInput) {
    super(Service.objectType, input);
  }
}
