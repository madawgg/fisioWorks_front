export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeWords(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map(word => capitalize(word))
    .join(" ");
}