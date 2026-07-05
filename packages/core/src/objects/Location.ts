import { Object as AposObject } from "./Object.js";
import type { ObjectInput } from "./Object.js";

/** Generic location knowledge object. */
export class Location extends AposObject {
  public static readonly objectType = "location";

  public constructor(input: ObjectInput) {
    super(Location.objectType, input);
  }
}
