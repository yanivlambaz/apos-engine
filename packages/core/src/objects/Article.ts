import { Object as AposObject } from "./Object.js";
import type { ObjectInput } from "./Object.js";

/** Generic article knowledge object. */
export class Article extends AposObject {
  public static readonly objectType = "article";

  public constructor(input: ObjectInput) {
    super(Article.objectType, input);
  }
}
