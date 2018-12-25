export function regExpFromString(regex: string) {
  let flags = regex.replace(/.*\/([gimuy]*)$/, "$1");
  if (flags === regex) flags = "";
  let pattern = flags
    ? regex.replace(new RegExp("^/(.*?)/" + flags + "$"), "$1")
    : regex;
  return new RegExp(pattern, flags);
}
