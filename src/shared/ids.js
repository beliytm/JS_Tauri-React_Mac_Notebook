// Только буквы и цифры: id используется и как имя файла в Rust
let counter = 0;

export function makeId(prefix) {
  counter += 1;
  return `${prefix}${Date.now().toString(36)}${counter.toString(36)}`;
}
