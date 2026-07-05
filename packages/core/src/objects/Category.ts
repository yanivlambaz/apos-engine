import { Object as AposObject } from "./Object.js";
import type { ObjectInput } from "./Object.js";

/** Generic category knowledge object. */
export class Category extends AposObject {
  public static readonly objectType = "category";

  public constructor(input: ObjectInput) {
    super(Category.objectType, input);
  }
}
