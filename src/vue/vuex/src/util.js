// 遍历对象
export function forEachValue (obj, fn) {
  Object.keys(obj).forEach((key) => fn(obj[key], key));
}

// 是否为对象
export function isObject (obj) {
  return obj !== null && typeof obj === "object";
}
