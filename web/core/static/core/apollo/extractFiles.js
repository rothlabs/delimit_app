//import isPlainObject from "is-plain-obj";

function isPlainObject(value) {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}


export function extractFiles(value, isExtractable, path = "") {
  if (!arguments.length) throw new TypeError("Argument 1 `value` is required.");

  if (typeof isExtractable !== "function")
    throw new TypeError("Argument 2 `isExtractable` must be a function.");

  if (typeof path !== "string")
    throw new TypeError("Argument 3 `path` must be a string.");


  const clones = new Map();

  const files = new Map();

  function recurse(value, path, recursed) {
    if (isExtractable(value)) {
      const filePaths = files.get(value);

      filePaths ? filePaths.push(path) : files.set(value, [path]);

      return null;
    }

    const valueIsList =
      Array.isArray(value) ||
      (typeof FileList !== "undefined" && value instanceof FileList);
    const valueIsPlainObject = isPlainObject(value);

    if (valueIsList || valueIsPlainObject) {
      let clone = clones.get(value);

      const uncloned = !clone;

      if (uncloned) {
        clone = valueIsList
          ? []
          : // Replicate if the plain object is an `Object` instance.
          value instanceof (Object)
          ? {}
          : Object.create(null);

        clones.set(value, (clone));
      }

      if (!recursed.has(value)) {
        const pathPrefix = path ? `${path}.` : "";
        const recursedDeeper = new Set(recursed).add(value);

        if (valueIsList) {
          let index = 0;

          for (const item of value) {
            const itemClone = recurse(
              item,
              pathPrefix + index++,
              recursedDeeper
            );

            if (uncloned) (clone).push(itemClone);
          }
        } else
          for (const key in value) {
            const propertyClone = recurse(
              value[key],
              pathPrefix + key,
              recursedDeeper
            );

            if (uncloned)
               (clone)[key] =
                propertyClone;
          }
      }

      return clone;
    }

    return value;
  }

  return {
    clone: recurse(value, path, new Set()),
    files,
  };
}
