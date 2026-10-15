const SPELLING: Array<[RegExp, string]> = [
  [/\bencyclopaedias\b/gi, "encyclopedias"],
  [/\bencyclopaedia\b/gi, "encyclopedia"],
  [/\bcatalogues\b/gi, "catalogs"],
  [/\bcatalogue\b/gi, "catalog"],
  [/\bcolours\b/gi, "colors"],
  [/\bcoloured\b/gi, "colored"],
  [/\bcolour\b/gi, "color"],
  [/\bfavourites\b/gi, "favorites"],
  [/\bfavourite\b/gi, "favorite"],
  [/\bflavours\b/gi, "flavors"],
  [/\bflavour\b/gi, "flavor"],
  [/\bbehaviours\b/gi, "behaviors"],
  [/\bbehaviour\b/gi, "behavior"],
  [/\bhonours\b/gi, "honors"],
  [/\bhonour\b/gi, "honor"],
  [/\bneighbours\b/gi, "neighbors"],
  [/\bneighbour\b/gi, "neighbor"],
  [/\bcentres\b/gi, "centers"],
  [/\bcentre\b/gi, "center"],
  [/\bgrey\b/gi, "gray"],
  [/\blabelling\b/gi, "labeling"],
  [/\blabelled\b/gi, "labeled"],
  [/\btravelling\b/gi, "traveling"],
  [/\btravelled\b/gi, "traveled"],
  [/\bcancelling\b/gi, "canceling"],
  [/\bcancelled\b/gi, "canceled"],
  [/\borganisation\b/gi, "organization"],
  [/\borganising\b/gi, "organizing"],
  [/\borganised\b/gi, "organized"],
  [/\bspecialised\b/gi, "specialized"],
  [/\brecognised\b/gi, "recognized"],
  [/\bwhilst\b/gi, "while"],
  [/\bmaths\b/gi, "math"],
  [/\bprogrammes\b/gi, "programs"],
  [/\bprogramme\b/gi, "program"],
  [/\bprimary school\b/gi, "elementary school"],
];

function matchCase(from: string, to: string) {
  if (from === from.toUpperCase()) return to.toUpperCase();
  if (from[0] === from[0]?.toUpperCase()) return to.charAt(0).toUpperCase() + to.slice(1);
  return to;
}

export function americanize(text: string) {
  return SPELLING.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, (found) => matchCase(found, replacement)),
    text,
  );
}
