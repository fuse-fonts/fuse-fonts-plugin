import TypefaceLibrary from "datatypes/typeface-library.js";
import uuid from "helpers/uuid.js";

export default class CustomGroup {

  constructor(ID, name, permanent = false) {
    this.ID = ID || uuid();
    this.name = name;
    this.typefaces = new TypefaceLibrary();
    this.isActive = false;
    this.permanent = permanent;
  }

  updateTypeFaces(typefaces) {
    this.typefaces = typefaces;
  }

  static getDefaultName(otherGroups) {
    const base = (i) => `Group ${i}`;
    
    let name = null;
    let n = 1;

    while (name === null) {
      let exists = otherGroups.find(g => g.name === base(n));
      if (exists) n++;
      else name = base(n);
    }

    return name;
  }
}
