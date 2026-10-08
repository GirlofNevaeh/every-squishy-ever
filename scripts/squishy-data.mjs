/** Catalog source. Run: node scripts/squishy-data.mjs */

const rebound = {
  "super-solid squish": "pushes back slowly until it is its old shape again",
  "slow-rise foam": "stays dented for a second, then rises nice and slow",
  foam: "stays dented for a second, then rises nice and slow",
  "soft dough": "smooshes flat, then puffs back like dough",
  maltose: "moves slow and thick, then creeps back into shape",
  gel: "jiggles and springs back smooth",
  "glitter gel": "jiggles while the glitter swirls, then settles",
  fuzzy: "feels soft first, then the inside gives and comes back",
  "air-filled": "springs fast because it is full of air",
  "air-whipped foam": "bounces back quickly, light as a bubble",
  "water-bead": "makes the tiny beads slide around your fingers",
  "bead mesh": "lets the beads rush to the other side of your fist",
};

const sizeWord = { mini: "tiny", standard: "palm-sized", jumbo: "big two-hand" };

const opens = [
  (p) => `${p.name} is a ${p.sizeWord} ${p.color} squishy shaped like ${p.hint}.`,
  (p) => `Meet ${p.name}. It is ${p.color} and shaped like ${p.hint}.`,
  (p) => `${p.name} looks like ${p.hint}, in a squeezable ${p.color} toy.`,
  (p) => `Hands love ${p.name}, a ${p.sizeWord} toy shaped like ${p.hint}.`,
];

const ends = [
  (p) => `Squeeze it and it ${p.rebound}.`,
  (p) => `Let go and it ${p.rebound}.`,
  (p) => `A gentle press is enough, then it ${p.rebound}.`,
  (p) => `It is quiet, kid-friendly fun, and it ${p.rebound}.`,
];

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const items = [];

function add(base, rows) {
  for (const row of rows) {
    const [name, color, fact, hint, extra = {}] = row;
    items.push({
      name,
      colors: String(color)
        .split(",")
        .map((part) => part.trim()),
      fact,
      hint,
      texture: base.texture,
      size: base.size,
      category: base.category,
      brand: base.brand,
      line: base.line ?? "",
      yearIntroduced: null,
      tags: base.tags ?? [],
      priceNote: base.priceNote,
      ...extra,
    });
  }
}

const needohPrice = "often around $8–15";
const miniPrice = "minis often around $5–10";
const stdPrice = "often around $6–14";
const jumboPrice = "jumbos often around $10–20";

add(
  {
    category: "NeeDoh",
    texture: "super-solid squish",
    size: "standard",
    brand: "Schylling",
    line: "NeeDoh",
    tags: ["needoh"],
    priceNote: needohPrice,
  },
  [
    ["Nice Cube", "ice blue, clear", "This is the famous cube that slowly creeps back into a square.", "a tidy ice cube", { id: "nice-cube", yearIntroduced: 2017, rank: 1 }],
    ["Nice Cube Swirl", "lilac, sky blue", "A marble swirl stretches when you press, then settles back into the cube.", "a cube with a color swirl inside", { id: "nice-cube-swirl" }],
    ["Nice Berg", "ice blue, clear", "It is the giant cube, so you need two hands to flatten it.", "a giant clear ice cube", { id: "nice-berg", size: "jumbo", priceNote: jumboPrice, rank: 4 }],
    ["Groovy Glob", "coral, lemon yellow", "Little nubs make it fun to pinch, and the blob puffs back together.", "a round blob with tiny nubs", { id: "groovy-glob", yearIntroduced: 2017, rank: 6 }],
    ["Gumdrop", "berry, coral", "The candy dome is firm, with little sugar-dot bumps.", "a classic gumdrop candy", { id: "gumdrop" }],
    ["Gummy Bear", "amber, coral", "Ears, belly, and paws all squish, then ease back into a bear.", "a gummy bear", { id: "needoh-gummy-bear", rank: 8 }],
    ["Cloud Pleaser", "pearlescent, ice blue", "It looks like a shiny cloud but feels thick and firm.", "a pearly cloud", { id: "cloud-pleaser" }],
    ["Nice Cube Glow", "glow green, ice blue", "Leave it in the light and it can glow when the room is dark.", "a cube that can glow", { id: "nice-cube-glow" }],
    ["Super Groovy Glob", "mint, sky blue", "This glob is jumbo, so the nubs are bigger under your palms.", "a giant nubby blob", { id: "super-groovy-glob", size: "jumbo", priceNote: jumboPrice }],
    ["Nice Cube Cherry", "cherry red, white", "Same slow cube family, dressed in candy-apple red.", "a cherry-red slow cube"],
    ["Nice Cube Ocean", "sky blue, ice blue", "Blue like a swimming pool, and it still returns to a square.", "a ocean-blue slow cube"],
    ["Nice Cube Grape", "grape purple, lilac", "A purple cube for anyone who likes grape-soda colors.", "a grape-purple slow cube"],
    ["Nice Cube Lemon", "lemon yellow, cream", "Bright as lemonade, with that slow firm push.", "a lemon-yellow slow cube"],
    ["Nice Cube Mint", "mint, white", "Cool mint green, tidy enough for a desk corner.", "a mint-green slow cube"],
  ],
);

add(
  {
    category: "NeeDoh",
    texture: "gel",
    size: "standard",
    brand: "Schylling",
    line: "NeeDoh",
    tags: ["needoh"],
    priceNote: needohPrice,
  },
  [
    ["Dream Drop", "lilac, ice blue", "Cup the raindrop and your fingers meet near the tip.", "a smooth raindrop", { id: "dream-drop", rank: 18 }],
    ["Groovy Fruit", "strawberry red, lemon yellow", "A little pack of glossy fruit you can pass around.", "a cluster of tiny glossy fruit", { id: "groovy-fruit", size: "mini", priceNote: "multi-packs often around $10–18" }],
    ["Galactic Glow Dream Drop", "galaxy purple, glow green", "A night-sky drop that can glow after a lamp charge.", "a glowing galaxy raindrop", { id: "galactic-dream-drop" }],
    ["Dream Drop Peach", "peach, cream", "A softer peach-colored drop, still smooth in one hand.", "a peach-colored raindrop"],
    ["Dream Drop Mint", "mint, white", "Mint colored and easy to roll between two palms.", "a mint raindrop"],
  ],
);

add(
  {
    category: "NeeDoh",
    texture: "super-solid squish",
    size: "mini",
    brand: "Schylling",
    line: "NeeDoh",
    tags: ["needoh", "mini"],
    priceNote: miniPrice,
  },
  [
    ["Nice Ice Baby", "ice blue, clear", "A pocket cube with the same slow push as the big Nice Cube.", "a teeny clear ice cube", { id: "nice-ice-baby", rank: 10 }],
    ["Nice Ice Baby Lemon", "lemon yellow, clear", "The tiny cube, this time in lemon yellow.", "a teeny lemon ice cube"],
    ["Nice Ice Baby Berry", "berry, clear", "Small enough for a pocket and berry colored.", "a teeny berry ice cube"],
  ],
);

add(
  {
    category: "NeeDoh",
    texture: "fuzzy",
    size: "standard",
    brand: "Schylling",
    line: "NeeDoh",
    tags: ["needoh", "fuzzy"],
    priceNote: needohPrice,
  },
  [
    ["Fuzz Ball", "blush, lilac", "Velvet fuzz comes first, then a dense middle.", "a round velvety fuzz ball", { id: "fuzz-ball", rank: 17 }],
    ["Fuzz Ball Flower Power", "blush, lemon yellow", "Petals are separate little pads you can pinch.", "a fuzzy flower", { id: "fuzz-ball-flower" }],
    ["Fuzz Ball Sky", "sky blue, white", "A blue fuzzy ball that feels like a tiny cloud sweater.", "a sky-blue fuzz ball"],
    ["Fuzz Ball Mint", "mint, cream", "Mint fuzz on the outside, squish in the middle.", "a mint fuzz ball"],
  ],
);

add(
  {
    category: "Other",
    texture: "air-filled",
    size: "standard",
    brand: "Schylling",
    line: "Classic",
    tags: ["schylling", "silly"],
    priceNote: "often around $8–14",
  },
  [
    ["Panic Pete", "peach, white", "Squeeze the silly face and the eyes and tongue pop out, then tuck back in. It is goofy, not spooky.", "a round smiling face with pop-out eyes", { id: "panic-pete", rank: 13 }],
  ],
);

add(
  {
    category: "Cheese",
    texture: "slow-rise foam",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["cheese", "food"],
    priceNote: stdPrice,
  },
  [
    ["Cheese Wedge Squishy", "cheddar, cream", "Round holes dot the wedge, and a thumbprint fades slowly.", "a yellow cheese wedge with holes", { id: "cheese-wedge", rank: 2 }],
    ["Swiss Cheese Slice Squishy", "butter yellow, cream", "A flat slice with bigger holes you can poke.", "a flat slice of swiss cheese", { id: "swiss-cheese-slice" }],
    ["Mini Cheddar Wedge", "cheddar, gold", "A snack-size wedge that hides in a pencil case.", "a mini cheddar wedge", { size: "mini", priceNote: miniPrice }],
    ["Marble Cheese Squishy", "cream, cheddar", "Swirls of white and orange like marble cheese.", "a marbled cheese wedge"],
    ["Cheese Wheel Squishy", "cheddar, cream", "A chubby wheel with a rind edge around the middle.", "a round cheese wheel"],
    ["String Cheese Squishy", "cream, butter yellow", "A skinny stick you can bend a little before it straightens.", "a stick of string cheese"],
    ["Pepper Jack Squishy", "cream, coral", "Pale cheese with tiny red flecks.", "a pepper jack cheese block"],
    ["Grilled Cheese Squishy", "toast, cheddar", "Bread on the outside and a cheese stripe in the middle.", "a grilled cheese sandwich"],
    ["Mac and Cheese Cup Squishy", "cheddar, cream", "A cup shape with noodle bumps on top.", "a cup of macaroni and cheese"],
    ["Cheese Puff Squishy", "orange, gold", "A puffy curl like a cheese snack.", "a cheese puff curl"],
    ["Blue Cheese Wedge", "cream, sky blue", "A pale wedge with blue-green specks. It is a toy, so it does not smell like the real thing.", "a blue cheese wedge"],
    ["Cheese Toastie Squishy", "toast, lemon yellow", "A square toastie with cheese peeking at the crust.", "a square cheese toastie"],
    ["Baby Cheese Trio", "cheddar, gold", "Three tiny wedges that stack into a triangle.", "three tiny cheese wedges", { size: "mini", priceNote: miniPrice }],
    ["Cheese Moon Squishy", "butter yellow, cream", "A crescent moon of cheese with two little holes.", "a crescent of cheese"],
    ["Smoked Cheese Block", "cocoa, cheddar", "A darker rind wrapped around an orange middle.", "a smoked cheese block"],
  ],
);

add(
  {
    category: "Cheese",
    texture: "slow-rise foam",
    size: "jumbo",
    brand: "Sunny Days Entertainment",
    line: "Toymendous",
    tags: ["cheese", "sunny days"],
    priceNote: jumboPrice,
  },
  [["Squishy Cheese Block", "cheddar, orange", "A big cheese cube from the Toymendous line, holes and all.", "a big cheese cube with holes", { id: "cheese-block" }]],
);

add(
  {
    category: "Butter & Bread",
    texture: "slow-rise foam",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["bakery"],
    priceNote: stdPrice,
  },
  [
    ["Butter Stick Squishy", "butter yellow, cream", "Scored lines let it bow a little, then it straightens.", "a stick of butter", { id: "butter-stick", rank: 3 }],
    ["Bread Loaf Squishy", "toast, cream", "A domed loaf with slash marks on top.", "a bread loaf", { id: "bread-loaf", rank: 9 }],
    ["Bread-and-Butter Squishy", "toast, butter yellow", "A little loaf and a butter stick you can stack.", "a small loaf beside a butter stick", { id: "bread-and-butter" }],
    ["Croissant Squishy", "gold, toast", "Ridge lines follow the curve so fingers can walk along them.", "a flaky croissant", { id: "croissant" }],
    ["Toast Slice Squishy", "toast, butter yellow", "A square slice with a darker crust and a bite taken out.", "a slice of toast with a bite", { id: "toast-slice" }],
    ["Bagel Squishy", "toast, cream", "A ring with a hole big enough for one finger.", "a bagel"],
    ["Pretzel Squishy", "cocoa, gold", "A twist with little salt dots.", "a soft pretzel"],
    ["Cinnamon Roll Squishy", "cream, cocoa", "A spiral with a cinnamon stripe.", "a cinnamon roll"],
    ["Pancake Stack Squishy", "gold, amber", "Three pancakes with a butter pat on top.", "a stack of pancakes"],
    ["Waffle Squishy", "gold, amber", "A grid you can press one square at a time.", "a round waffle"],
    ["Biscuit Squishy", "cream, toast", "A fluffy round biscuit with a soft top.", "a fluffy biscuit"],
    ["Baguette Squishy", "toast, gold", "A long loaf with diagonal slashes.", "a skinny baguette"],
    ["Dinner Roll Squishy", "gold, cream", "A smooth round roll that fits one palm.", "a round dinner roll"],
    ["Banana Bread Squishy", "cocoa, gold", "A loaf with a crack down the middle like banana bread.", "a loaf of banana bread"],
    ["Cornbread Squishy", "lemon yellow, gold", "A square of cornbread with a crumbly-looking top.", "a square of cornbread"],
    ["Honey Butter Pat", "butter yellow, amber", "A little pat with a honey drip down one side.", "a pat of honey butter", { size: "mini", priceNote: miniPrice }],
    ["Garlic Bread Squishy", "toast, cream", "A split loaf with pale garlic flecks.", "a piece of garlic bread"],
    ["English Muffin Squishy", "cream, toast", "A round muffin with a nubby top.", "an english muffin"],
    ["Whipped Butter Swirl", "cream, butter yellow", "A tall swirl like butter from a piping bag.", "a swirl of whipped butter"],
    ["Breadstick Squishy", "gold, toast", "A long stick you can bend gently.", "a breadstick"],
  ],
);

add(
  {
    category: "Butter & Bread",
    texture: "slow-rise foam",
    size: "jumbo",
    brand: "Sunny Days Entertainment",
    line: "Toymendous",
    tags: ["butter", "sunny days"],
    priceNote: jumboPrice,
  },
  [["Toymendous Squeeze Butter", "butter yellow, gold", "The long store butter, big enough for two hands.", "a jumbo stick of butter", { id: "toymendous-butter", rank: 14 }]],
);

add(
  {
    category: "Dumpling",
    texture: "slow-rise foam",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["dumpling"],
    priceNote: stdPrice,
  },
  [
    ["Bao Bun Squishy", "cream, blush", "A round steamed bun with a pleat on top.", "a steamed bao bun", { id: "bao-bun" }],
    ["Onigiri Squishy", "white, nori", "A rice triangle with a dark nori belt.", "a triangular rice ball", { id: "onigiri" }],
    ["Gyoza Squishy", "cream, gold", "A crescent with pleat lines along the edge.", "a pan-fried gyoza"],
    ["Soup Dumpling Squishy", "cream, amber", "A plump pouch with a little swirl on top.", "a soup dumpling"],
    ["Pierogi Squishy", "cream, gold", "A plump half-moon with a crimped edge.", "a pierogi"],
    ["Samosa Squishy", "gold, cocoa", "A triangle with a crimped seam.", "a samosa"],
    ["Potsticker Squishy", "cream, toast", "One side looks golden, like it sat in a pan.", "a potsticker"],
    ["Shumai Squishy", "cream, coral", "A little cup shape with a ruffled top.", "a shumai dumpling"],
    ["Mandu Squishy", "cream, leaf green", "A chubby Korean-style dumpling with a tiny bow pleat.", "a mandu dumpling"],
    ["Empanada Squishy", "gold, cocoa", "A baked half-moon with fork marks on the edge.", "an empanada"],
    ["Spring Roll Squishy", "gold, leaf green", "A slim roll with a lettuce tip peeking out.", "a spring roll"],
    ["Har Gow Squishy", "clear, coral", "A see-through dumpling with a shrimp-pink middle.", "a crystal shrimp dumpling", { texture: "gel" }],
    ["Dumpling Family", "cream, blush", "Three little dumplings that sit in a row.", "three little dumplings", { size: "mini", priceNote: miniPrice }],
  ],
);

add(
  {
    category: "Dumpling",
    texture: "glitter gel",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["dumpling", "glitter"],
    priceNote: stdPrice,
  },
  [
    ["Glitter Dumpling", "lilac, ice blue", "Sparkles shift inside when you pinch the pleats.", "a glitter-filled dumpling", { id: "glitter-dumpling" }],
    ["Galaxy Dumpling", "galaxy purple, glow green", "A dark crescent with starry glitter.", "a galaxy glitter dumpling"],
    ["Pink Glitter Dumpling", "blush, white", "A rosy dumpling full of fine sparkle.", "a pink glitter dumpling"],
  ],
);

add(
  {
    category: "Mochi & Candy",
    texture: "soft dough",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["mochi"],
    priceNote: stdPrice,
  },
  [
    ["Mochi Squishy", "blush, white", "A round bun with a tiny face and a powdery look.", "a round mochi bun with a tiny face", { id: "mochi-squishy", rank: 5 }],
    ["Strawberry Mochi Squishy", "blush, strawberry red", "Pink cheeks and a green leaf cap.", "a strawberry mochi bun"],
    ["Mango Mochi Squishy", "gold, orange", "Sunny mango yellow with a soft square bottom.", "a mango mochi bun"],
    ["Matcha Mochi Squishy", "leaf green, cream", "Tea green and matte, easy to flatten.", "a matcha mochi bun"],
    ["Taro Mochi Squishy", "lilac, cream", "Pale purple like taro ice cream.", "a taro mochi bun"],
    ["Ube Mochi Squishy", "grape purple, white", "Deep purple with a white powder dust.", "an ube mochi bun"],
    ["Chocolate Mochi Squishy", "cocoa, cream", "A cocoa bun with a tiny smile.", "a chocolate mochi bun"],
    ["Vanilla Mochi Squishy", "cream, white", "The plain sweet one, extra soft.", "a vanilla mochi bun"],
    ["Blueberry Mochi Squishy", "sky blue, grape purple", "Blue-purple and round as a berry.", "a blueberry mochi bun"],
    ["Peach Mochi Squishy", "peach, cream", "A peachy bun with a little cleft line.", "a peach mochi bun"],
    ["Lemon Mochi Squishy", "lemon yellow, cream", "Bright lemon with a tiny leaf.", "a lemon mochi bun"],
    ["Coconut Mochi Squishy", "white, cream", "Snowy white with flake specks.", "a coconut mochi bun"],
    ["Raspberry Mochi Squishy", "berry, blush", "Deep berry pink and very smooshable.", "a raspberry mochi bun"],
    ["Sesame Mochi Squishy", "charcoal, cream", "Speckled black and white like sesame.", "a sesame mochi bun"],
    ["Milk Mochi Squishy", "cream, white", "Plain milk-white and pillow soft.", "a milk mochi bun"],
    ["Banana Mochi Squishy", "lemon yellow, cream", "A yellow bun with a tiny brown tip.", "a banana mochi bun"],
    ["Melon Mochi Squishy", "mint, cream", "Pale green like honeydew.", "a melon mochi bun"],
    ["Lychee Mochi Squishy", "blush, white", "Blush pink with a bumpy little cap.", "a lychee mochi bun"],
    ["Red Bean Mochi Squishy", "berry, cocoa", "A pink bun with a cocoa-colored center dot.", "a red bean mochi bun"],
    ["Pistachio Mochi Squishy", "mint, cream", "Soft green with a nut-colored spot.", "a pistachio mochi bun"],
  ],
);

add(
  {
    category: "Mochi & Candy",
    texture: "slow-rise foam",
    size: "mini",
    brand: "Generic",
    line: "",
    tags: ["candy"],
    priceNote: miniPrice,
  },
  [
    ["Macaron Squishy", "blush, mint", "Two shells and a filling stripe that bulges when pressed.", "a pink macaron", { id: "macaron", size: "mini" }],
    ["Rose Macaron", "blush, white", "A rose-pink macaron with a cream filling.", "a rose macaron"],
    ["Pistachio Macaron", "mint, cream", "Green shells with a pale filling.", "a pistachio macaron"],
    ["Chocolate Macaron", "cocoa, cream", "Cocoa shells and a tan middle.", "a chocolate macaron"],
    ["Lemon Macaron", "lemon yellow, white", "Sunny shells with a white filling.", "a lemon macaron"],
    ["Raspberry Macaron", "berry, blush", "Bright berry shells.", "a raspberry macaron"],
    ["Vanilla Macaron", "cream, white", "A pale macaron, simple and sweet looking.", "a vanilla macaron"],
    ["Lavender Macaron", "lilac, white", "Soft purple shells.", "a lavender macaron"],
    ["Caramel Macaron", "amber, gold", "Golden shells with a darker stripe.", "a caramel macaron"],
    ["Candy Corn Squishy", "white, orange", "Three bands: white, orange, and yellow. The point pinches small.", "a candy corn", { id: "candy-corn", size: "standard", priceNote: stdPrice }],
    ["Heart Candy Squishy", "blush, berry", "A conversation-heart shape with a blank middle you can imagine words on.", "a candy heart", { size: "mini" }],
    ["Star Candy Squishy", "lemon yellow, gold", "A puffy star that fits a pocket.", "a candy star"],
    ["Lollipop Squishy", "berry, white", "A round pop on a short stick.", "a round lollipop", { size: "standard", priceNote: stdPrice }],
    ["Peppermint Squishy", "white, berry", "A round mint with a red swirl.", "a peppermint candy"],
    ["Marshmallow Squishy", "white, blush", "A chubby cylinder that smooshes very easily.", "a marshmallow", { texture: "soft dough", size: "standard", priceNote: stdPrice }],
    ["Gummy Worm Squishy", "coral, lemon yellow", "A bendy worm with stripes.", "a striped gummy worm", { size: "standard", priceNote: stdPrice }],
    ["Chocolate Bar Squishy", "cocoa, gold", "A scored bar you can pretend to break, but it stays one toy.", "a chocolate bar", { size: "standard", priceNote: stdPrice }],
    ["Cookie Squishy", "gold, cocoa", "A round cookie with chocolate chips.", "a chocolate chip cookie", { size: "standard", priceNote: stdPrice }],
    ["Brownie Squishy", "cocoa, gold", "A fudgy square with a crackly top.", "a chocolate brownie", { size: "standard", priceNote: stdPrice }],
    ["Cupcake Squishy", "blush, cream", "A wrapper and a tall frosting swirl.", "a cupcake with a frosting swirl", { size: "standard", priceNote: stdPrice }],
    ["Cake Pop Squishy", "berry, white", "A ball on a stick with sprinkle dots.", "a cake pop", { size: "standard", priceNote: stdPrice }],
    ["Cotton Candy Squishy", "blush, sky blue", "A fluffy cloud on a cone.", "a puff of cotton candy", { size: "standard", priceNote: stdPrice }],
    ["Jelly Bean Squishy", "mint, berry", "A tiny bean with a shine.", "a jelly bean"],
    ["Bubblegum Squishy", "blush, white", "A round gum ball, pink and chubby.", "a bubblegum ball"],
    ["Licorice Twist Squishy", "berry, charcoal", "A red and black twist.", "a licorice twist", { size: "standard", priceNote: stdPrice }],
    ["Caramel Cube Squishy", "amber, gold", "A shiny amber cube that looks sticky but feels like foam.", "a caramel cube", { texture: "slow-rise foam" }],
    ["Fudge Square Squishy", "cocoa, cream", "A dark square with a wavy top.", "a square of fudge"],
    ["Truffle Squishy", "cocoa, gold", "A round chocolate with a swirl on top.", "a chocolate truffle"],
    ["Gingerbread Squishy", "cocoa, white", "A person shape with icing lines. Friendly, not spooky.", "a gingerbread person", { size: "standard", priceNote: stdPrice }],
    ["Candy Cane Squishy", "white, berry", "A hooked cane with red stripes.", "a candy cane", { size: "standard", priceNote: stdPrice }],
  ],
);

add(
  {
    category: "Mochi & Candy",
    texture: "slow-rise foam",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["gummy", "foam"],
    priceNote: stdPrice,
  },
  [
    ["Gummy Bear Foam Squishy", "lemon yellow, coral", "A light bear that rises slowly. Not the dense NeeDoh bear.", "a bright foam gummy bear", { id: "gummy-bear-foam" }],
    ["Gummy Bear Foam Berry", "berry, blush", "The foam bear in berry red.", "a berry-red foam gummy bear"],
    ["Gummy Bear Foam Grape", "grape purple, lilac", "A purple foam bear with a round belly.", "a purple foam gummy bear"],
    ["Gummy Bear Foam Clear", "ice blue, clear", "A pale bear that looks a bit see-through.", "a pale clear-looking foam gummy bear", { texture: "gel" }],
  ],
);

add(
  {
    category: "Fruit & Food",
    texture: "slow-rise foam",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["food"],
    priceNote: stdPrice,
  },
  [
    ["Avocado Squishy", "leaf green, cocoa", "The pit in the middle squishes separately from the green part.", "half an avocado with a pit", { id: "avocado", rank: 7 }],
    ["Egg Squishy", "white, yolk", "A sunny-side egg. The yolk domes under your thumb.", "a fried egg", { id: "egg", rank: 15 }],
    ["Pizza Slice Squishy", "gold, berry", "The point squishes differently from the crust.", "a slice of pizza", { id: "pizza-slice" }],
    ["Donut Squishy", "blush, cream", "A ring with a hole and sprinkle dots.", "a sprinkled donut", { id: "donut", rank: 12 }],
    ["Ice Cream Cone Squishy", "blush, toast", "Scoops mush first. The cone is a little firmer.", "an ice cream cone with two scoops", { id: "ice-cream-cone", rank: 20 }],
    ["Burger Squishy", "toast, leaf green", "You can see the bun, patty, and lettuce layers.", "a hamburger", { id: "burger", rank: 19 }],
    ["Watermelon Slice Squishy", "watermelon pink, leaf green", "A green rind, pale pith, and a pink middle with seeds.", "a slice of watermelon", { id: "watermelon" }],
    ["Peach Squishy", "peach, leaf green", "Press the cleft and it closes, then eases open.", "a peach with a leaf", { id: "peach" }],
    ["Slow-Rise Foam Squishy", "blush, cream", "A layer cake that holds a handprint, then climbs back. This is the classic slow foam feel.", "a little layer cake", { id: "slow-rise-foam" }],
    ["Fries Squishy", "gold, berry", "A carton of fries you can press from the top.", "a carton of french fries"],
    ["Hot Dog Squishy", "coral, gold", "A bun with a sausage tucked in.", "a hot dog in a bun"],
    ["Taco Squishy", "gold, leaf green", "A folded shell with lettuce and tomato spots.", "a taco"],
    ["Sushi Squishy", "white, coral", "A nigiri piece with a pink fish top.", "a piece of sushi"],
    ["Ramen Bowl Squishy", "cream, gold", "A bowl with noodle loops on top.", "a bowl of ramen"],
    ["Popcorn Squishy", "cream, butter yellow", "A cluster of puffy kernels.", "a cluster of popcorn"],
    ["Bacon Strip Squishy", "coral, cream", "A wavy strip with pink and cream bands.", "a strip of bacon"],
    ["Sandwich Squishy", "toast, leaf green", "Two bread squares with a filling stripe.", "a sandwich"],
    ["Chicken Nugget Squishy", "gold, toast", "A nugget shape with a bumpy crust.", "a chicken nugget"],
    ["Apple Squishy", "berry, leaf green", "A round apple with a stem and leaf.", "a red apple"],
    ["Banana Squishy", "lemon yellow, gold", "A curved banana that can flex a little.", "a banana"],
    ["Grape Bunch Squishy", "grape purple, leaf green", "A cluster of round grapes.", "a bunch of grapes"],
    ["Orange Squishy", "orange, leaf green", "A dimpled orange with a leaf.", "an orange"],
    ["Lemon Squishy", "lemon yellow, leaf green", "A bright lemon with a pointy end.", "a lemon"],
    ["Blueberry Squishy", "sky blue, grape purple", "A tiny round berry with a star top.", "a blueberry", { size: "mini", priceNote: miniPrice }],
    ["Mango Squishy", "gold, leaf green", "A smooth oval with a blush of red.", "a mango"],
    ["Kiwi Squishy", "leaf green, cream", "A slice with a white middle and seed dots.", "a kiwi slice"],
    ["Pineapple Squishy", "gold, leaf green", "A body with a leafy crown.", "a pineapple"],
    ["Cherry Pair Squishy", "berry, leaf green", "Two cherries on one stem.", "two cherries"],
    ["Pear Squishy", "leaf green, gold", "A pear with a stem, soft all the way through.", "a pear"],
    ["Corn Cob Squishy", "lemon yellow, leaf green", "Rows of kernels you can feel.", "an ear of corn"],
    ["Tomato Squishy", "berry, leaf green", "A round tomato with a green cap.", "a tomato"],
    ["Carrot Squishy", "orange, leaf green", "A cone with a leafy top.", "a carrot"],
    ["Broccoli Squishy", "leaf green, mint", "A tree top on a pale stalk.", "a broccoli floret"],
    ["Mushroom Squishy", "cream, cocoa", "A cap and a stem. Cute, not spooky.", "a mushroom"],
    ["Bento Box Squishy", "white, coral", "A little box with rice and a heart.", "a bento box"],
    ["Milkshake Squishy", "blush, cream", "A cup with a dome of whipped cream.", "a milkshake"],
    ["Pie Slice Squishy", "gold, berry", "A triangle of pie with a crimped crust.", "a slice of pie"],
    ["Pudding Cup Squishy", "cocoa, gold", "A cup with a wavy chocolate top.", "a cup of pudding"],
    ["Yogurt Cup Squishy", "white, berry", "A cup with a berry swirl on top.", "a cup of yogurt"],
    ["Onion Ring Squishy", "gold, toast", "A crunchy-looking ring.", "an onion ring"],
    ["Nugget Box Squishy", "gold, berry", "A box with nuggets peeking out.", "a box of nuggets"],
    ["Milk Carton Squishy", "white, sky blue", "A little carton with a peaked top.", "a milk carton"],
    ["Juice Box Squishy", "orange, straw", "A box with a straw. The straw is part of the toy.", "a juice box", { colors: ["orange", "white"] }],
    ["Pancake Single Squishy", "gold, amber", "One thick pancake with a syrup drip.", "a single pancake"],
    ["Fried Chicken Squishy", "gold, cocoa", "A drumstick with a craggy coat.", "a fried chicken drumstick"],
  ],
);

add(
  {
    category: "Fruit & Food",
    texture: "slow-rise foam",
    size: "jumbo",
    brand: "Sunny Days Entertainment",
    line: "Toymendous",
    tags: ["sunny days", "squeezy"],
    priceNote: jumboPrice,
  },
  [
    ["Sunny Days Squeezy Strawberry", "strawberry red, leaf green", "A jumbo Toymendous strawberry with seed bumps.", "a jumbo strawberry", { id: "sunny-days-squeezy", rank: 16 }],
    ["Toymendous Squeezy Donut", "blush, gold", "The big Sunny Days donut with icing and sprinkles.", "a jumbo donut"],
    ["Toymendous Squeezy Burger", "toast, leaf green", "A jumbo burger from the Squeezy food line.", "a jumbo hamburger"],
    ["Toymendous Ice Cream", "blush, toast", "A tall cone from the Sunny Days slow-foam line.", "a jumbo ice cream cone"],
  ],
);

add(
  {
    category: "Animal",
    texture: "soft dough",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["animal", "mochi"],
    priceNote: stdPrice,
  },
  [
    ["Mochi Cat", "cream, blush", "Cheeks squish into the tiny face. Ears stay pointy.", "a chubby mochi cat", { id: "mochi-cat" }],
    ["Mochi Puppy", "gold, cream", "Floppy ears and a round mochi body.", "a mochi puppy"],
    ["Mochi Bunny", "white, blush", "Long ears you can pinch one at a time.", "a mochi bunny"],
    ["Mochi Bear", "cocoa, cream", "A round bear with a cream snout.", "a mochi bear"],
    ["Mochi Pig", "blush, berry", "A snout that squishes in.", "a mochi pig"],
  ],
);

add(
  {
    category: "Animal",
    texture: "slow-rise foam",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["animal"],
    priceNote: stdPrice,
  },
  [
    ["Frog Squishy", "leaf green, cream", "Eyes sit on top so thumbs can pinch them.", "a wide-eyed frog", { id: "frog" }],
    ["Chick Squishy", "lemon yellow, orange", "A round chick that turns oval when squeezed.", "a round chick", { id: "chick", size: "mini", priceNote: miniPrice }],
    ["Whale Squishy", "sky blue, white", "Bend the tail or press the belly.", "a round whale", { id: "whale" }],
    ["Panda Squishy", "white, charcoal", "Black ears and eyes on a white belly.", "a panda"],
    ["Penguin Squishy", "charcoal, white", "A tuxedo belly and a small beak.", "a penguin"],
    ["Bunny Squishy", "white, blush", "Tall ears and a cotton tail.", "a bunny"],
    ["Dino Squishy", "mint, leaf green", "A friendly long-neck dinosaur. No sharp bits.", "a friendly dinosaur"],
    ["Unicorn Squishy", "white, blush", "A pastel horn and a round body.", "a round unicorn"],
    ["Octopus Squishy", "coral, blush", "Eight short arms you can squish together.", "a cute octopus"],
    ["Turtle Squishy", "leaf green, gold", "A shell with spots and a little head.", "a turtle"],
    ["Shark Squishy", "sky blue, white", "A smiling shark. Friendly, not fierce.", "a smiling shark"],
    ["Bee Squishy", "lemon yellow, charcoal", "Stripes and two tiny wings.", "a bumblebee"],
    ["Ladybug Squishy", "berry, charcoal", "A red dome with black spots.", "a ladybug"],
    ["Fox Squishy", "orange, white", "A pointy face and a fluffy-looking tail.", "a fox"],
    ["Pig Squishy", "blush, berry", "A round pig with a snout.", "a pig"],
    ["Cow Squishy", "white, charcoal", "Spots and a pink nose.", "a cow"],
    ["Duck Squishy", "lemon yellow, orange", "A beak and a rounded body.", "a duck"],
    ["Lion Squishy", "gold, orange", "A mane of rounded bumps.", "a lion"],
    ["Koala Squishy", "gray, white", "Round ears and a big nose.", "a koala", { colors: ["charcoal", "white"] }],
    ["Sloth Squishy", "cocoa, cream", "A smiling face and long soft arms.", "a sloth"],
    ["Narwhal Squishy", "sky blue, white", "A whale with one spiral horn.", "a narwhal"],
    ["Crab Squishy", "coral, white", "Two claws that pinch flat.", "a crab"],
    ["Butterfly Squishy", "lilac, blush", "Wings you can press together.", "a butterfly"],
    ["Hedgehog Squishy", "cocoa, cream", "Soft bumps, not sharp spikes.", "a hedgehog"],
    ["Seal Squishy", "charcoal, white", "A sleek body and whisker dots.", "a seal"],
    ["Dolphin Squishy", "sky blue, white", "A curved smile and a fin.", "a dolphin"],
    ["Capybara Squishy", "toast, cream", "A calm rectangle face. Very chill.", "a capybara"],
    ["Axolotl Squishy", "blush, white", "Frilly gills and a smile.", "an axolotl"],
    ["Tiger Squishy", "orange, charcoal", "Stripes and round ears.", "a tiger"],
    ["Zebra Squishy", "white, charcoal", "Bold stripes around a round body.", "a zebra"],
    ["Giraffe Squishy", "gold, cocoa", "Spots and two little ossicones.", "a giraffe"],
    ["Elephant Squishy", "sky blue, blush", "Big ears and a short trunk.", "an elephant"],
    ["Owl Squishy", "cocoa, gold", "Round eyes and a small beak.", "an owl"],
    ["Hamster Squishy", "gold, white", "Cheek pouches that squish in.", "a hamster"],
    ["Jellyfish Squishy", "lilac, ice blue", "A bell top and short wiggly arms.", "a jellyfish", { texture: "gel" }],
    ["Starfish Squishy", "orange, gold", "Five arms, one palm.", "a starfish"],
    ["Flamingo Squishy", "blush, white", "A curved neck and one standing leg.", "a flamingo"],
    ["Squirrel Squishy", "orange, cream", "A big tail curled up.", "a squirrel"],
    ["Raccoon Squishy", "charcoal, white", "A mask and a ringed tail.", "a raccoon"],
    ["Hippo Squishy", "lilac, white", "A wide smile and tiny ears.", "a hippo"],
    ["Polar Bear Squishy", "white, charcoal", "A snowy bear with a black nose.", "a polar bear"],
    ["Red Panda Squishy", "orange, cream", "A rusty coat and a ringed tail.", "a red panda"],
    ["Toymendous Panda", "white, charcoal", "A jumbo slow-foam panda from Sunny Days.", "a jumbo panda", { brand: "Sunny Days Entertainment", line: "Toymendous", size: "jumbo", priceNote: jumboPrice, tags: ["sunny days", "animal"] }],
  ],
);

add(
  {
    category: "Cube & Stress",
    texture: "maltose",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["cube"],
    priceNote: "often around $8–16",
  },
  [
    ["Sugar Squeeze Cube", "amber, clear", "A generic cube that moves slow and thick. It is not a Schylling NeeDoh.", "a thick amber sugar cube", { id: "sugar-squeeze-cube" }],
    ["Mini Maltose Cube", "amber, gold", "The same slow thick feel, pocket sized.", "a tiny amber cube", { size: "mini", priceNote: miniPrice }],
    ["Clear Maltose Cube", "clear, ice blue", "See-through and slow, like a block of honey.", "a clear slow cube"],
  ],
);

add(
  {
    category: "Cube & Stress",
    texture: "gel",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["jelly", "cube"],
    priceNote: stdPrice,
  },
  [
    ["Jelly Cube", "ice blue, clear", "A wobbly clear cube with bubbles inside. It snaps back faster than foam.", "a clear jelly cube", { id: "jelly-cube" }],
    ["Jelly Cube Berry", "berry, clear", "A red jelly cube that jiggles.", "a berry jelly cube"],
    ["Jelly Cube Lemon", "lemon yellow, clear", "A yellow jelly cube full of tiny bubbles.", "a lemon jelly cube"],
    ["Jelly Cube Grape", "grape purple, clear", "A purple jelly cube.", "a grape jelly cube"],
    ["Jelly Cube Mint", "mint, clear", "A green jelly cube, cool looking and wiggly.", "a mint jelly cube"],
  ],
);

add(
  {
    category: "Cube & Stress",
    texture: "air-whipped foam",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["ball"],
    priceNote: "often around $5–10",
  },
  [["Classic Stress Ball", "sky blue, white", "A plain round ball that bounces back fast. No theme, just a squeeze.", "a round foam stress ball", { id: "stress-ball" }]],
);

add(
  {
    category: "Cube & Stress",
    texture: "water-bead",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["sensory"],
    priceNote: stdPrice,
  },
  [
    ["Water Bead Squeeze Ball", "clear, sky blue", "Tiny beads slide inside a clear skin. Keep it in one piece.", "a clear ball full of water beads", { id: "water-bead-ball" }],
    ["Water Bead Ball Pink", "blush, white", "Pink beads that rush around when you squeeze.", "a clear ball full of pink beads"],
    ["Water Bead Ball Galaxy", "galaxy purple, glow green", "Dark beads with bright specks.", "a clear ball full of galaxy beads"],
  ],
);

add(
  {
    category: "Cube & Stress",
    texture: "bead mesh",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["mesh"],
    priceNote: "often around $5–12",
  },
  [
    ["Mesh Bead Stress Ball", "lilac, sky blue", "A stretchy net full of beads that rush sideways.", "a mesh ball full of beads", { id: "mesh-bead-ball" }],
    ["Mesh Ball Rainbow", "coral, lemon yellow", "Bright beads in a rainbow net.", "a rainbow mesh bead ball"],
  ],
);

add(
  {
    category: "Cube & Stress",
    texture: "slow-rise foam",
    size: "standard",
    brand: "Generic",
    line: "",
    tags: ["cube"],
    priceNote: stdPrice,
  },
  [
    ["Cherry Foam Cube", "cherry red, white", "A red slow-rise cube, lighter than a NeeDoh.", "a cherry-red foam cube"],
    ["Ocean Foam Cube", "sky blue, white", "A blue foam cube that rises after a squeeze.", "an ocean-blue foam cube"],
    ["Grape Foam Cube", "grape purple, white", "A purple foam cube.", "a grape foam cube"],
    ["Lemon Foam Cube", "lemon yellow, cream", "A yellow foam cube, bright and light.", "a lemon foam cube"],
    ["Mint Foam Cube", "mint, white", "A green foam cube for a calm color.", "a mint foam cube"],
    ["Blush Foam Cube", "blush, white", "A pink foam cube.", "a blush-pink foam cube"],
    ["Orange Foam Cube", "orange, gold", "An orange foam cube like a fruit block.", "an orange foam cube"],
    ["Galaxy Foam Cube", "galaxy purple, glow green", "A dark cube with speckles.", "a galaxy foam cube"],
    ["Marble Foam Cube", "white, sky blue", "Swirled white and blue foam.", "a marbled foam cube"],
    ["Heart Stress Squishy", "blush, berry", "A plump heart in slow foam.", "a plump heart"],
    ["Star Stress Squishy", "lemon yellow, gold", "A puffy star that rises slowly.", "a puffy star"],
    ["Soft Die Squishy", "white, charcoal", "A round-cornered die with dots. Just a toy, for squeezing.", "a soft die"],
    ["Rainbow Arch Squishy", "coral, sky blue", "A little arch with bands of color.", "a rainbow arch"],
    ["Smiley Ball Squishy", "lemon yellow, charcoal", "A yellow ball with a simple smile.", "a smiley face ball", { texture: "air-whipped foam" }],
    ["Flower Squishy", "blush, leaf green", "Five petals around a round middle.", "a simple flower"],
    ["Planet Squishy", "sky blue, leaf green", "A round planet with a tiny ring.", "a cute planet"],
    ["Moon Squishy", "cream, gold", "A crescent moon with a sleepy face.", "a crescent moon"],
    ["Sun Squishy", "lemon yellow, orange", "A round sun with short rays.", "a smiling sun"],
    ["Gem Squishy", "ice blue, lilac", "A diamond shape that is soft, not hard.", "a soft gemstone"],
    ["Friendly Alien Squishy", "mint, galaxy purple", "One big eye and a smile. A pal, not a monster.", "a friendly one-eyed alien"],
    ["Marshmallow Ghost", "white, blush", "A cute ghost blob with two dot eyes. Sweet, not scary.", "a cute marshmallow ghost"],
    ["Pumpkin Squishy", "orange, leaf green", "A round pumpkin with a happy face and a stem.", "a cute pumpkin"],
    ["Snowman Squishy", "white, charcoal", "Two spheres, a scarf stripe, and a smile.", "a snowman"],
    ["Cactus Squishy", "leaf green, blush", "A pot cactus with a flower. The bumps are soft.", "a cactus in a pot"],
    ["Robot Cube Squishy", "sky blue, white", "A cube with a friendly face panel.", "a friendly robot cube"],
  ],
);

add(
  {
    category: "Mystery Box",
    texture: "soft dough",
    size: "mini",
    brand: "Generic",
    line: "",
    tags: ["mystery", "blind box"],
    priceNote: "varies; check Amazon",
  },
  [
    ["Mystery Dumpling Box", "blush, cream", "A sealed box of little dumplings. You do not know the faces until you open it.", "a mystery box with a dumpling peeking out", { id: "mystery-dumpling-box", rank: 11 }],
    ["Mystery Mochi Box", "lilac, blush", "Tiny mochi friends hide inside until the box opens.", "a mystery box with a mochi peeking out", { id: "mystery-mochi-box" }],
    ["Mystery Fruit Box", "leaf green, berry", "A surprise mix of fruit squishies.", "a mystery box with fruit peeking out"],
    ["Mystery Animal Box", "gold, mint", "A blind box of little animal squishies.", "a mystery box with an animal ear peeking out"],
    ["Mystery Candy Box", "blush, lemon yellow", "Candy-shaped squishies, colors unknown until you open it.", "a mystery box with candy peeking out"],
    ["Mystery Bakery Box", "toast, cream", "Tiny breads and sweets in one surprise box.", "a bakery mystery box"],
    ["Mystery Sea Box", "sky blue, white", "Ocean animals hiding in a blue box.", "a sea-themed mystery box"],
    ["Dino Egg Mystery", "mint, gold", "A squishy egg. The dino style is a surprise.", "a speckled dino egg", { texture: "slow-rise foam", size: "standard", priceNote: stdPrice }],
    ["Galaxy Mystery Box", "galaxy purple, glow green", "Dark box, bright surprise squishies.", "a galaxy mystery box"],
    ["Farm Mystery Box", "leaf green, gold", "Farm animals, one surprise at a time.", "a farm mystery box"],
    ["Mini Cube Mystery", "ice blue, lilac", "A handful of tiny cubes in mixed colors.", "a box of tiny mystery cubes", { texture: "slow-rise foam" }],
    ["Toast Surprise Box", "toast, butter yellow", "Breakfast squishies packed as a surprise.", "a breakfast mystery box"],
  ],
);

const AMAZON_ASIN = {
  "nice-cube": "B0BQZFVJTB",
  "nice-cube-glow": "B0DV4BFJBY",
  "groovy-glob": "B076FGVCRH",
  gumdrop: "B0C6XBP4CW",
  "panic-pete": "B001R57O88",
  "nice-berg": "B0D9ZP62TR",
  "cheese-block": "B0CNTWGK1F",
  "toymendous-butter": "B0GZR1J7K1",
};

const rankById = {};
const built = items.map((item, index) => {
  const id = item.id || slug(item.name);
  const color = item.colors[0];
  const texture = item.texture;
  const size = item.size;
  const draft = {
    ...item,
    id,
    color,
    sizeWord: sizeWord[size],
    rebound: rebound[texture],
  };
  const description = `${opens[index % opens.length](draft)} ${item.fact} ${ends[index % ends.length](draft)}`;
  if (item.rank) rankById[id] = item.rank;
  const tags = [...new Set([...(item.tags ?? []), texture.split(" ")[0], size, item.category.split(" ")[0].toLowerCase()])];
  return {
    id,
    name: item.name,
    brand: item.brand,
    line: item.line,
    category: item.category,
    texture,
    size,
    colors: item.colors,
    yearIntroduced: item.yearIntroduced,
    description,
    tags,
    amazonQuery:
      item.brand === "Generic" ? `${item.name}` : `${item.brand} ${item.name}`,
    amazonAsin: AMAZON_ASIN[id] ?? null,
    priceNote: item.priceNote,
    imageKey: item.imageKey || id,
    image: `/squishies/${id}.jpg`,
    youtubeQuery: /squishy/i.test(item.name) ? item.name : `${item.name} squishy`,
    bestsellerRank: item.rank ?? null,
    imageHint: item.hint,
  };
});

const ids = built.map((item) => item.id);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
const descriptions = built.map((item) => item.description);
const dupDesc = descriptions.filter((d, i) => descriptions.indexOf(d) !== i);
if (dupIds.length || dupDesc.length) {
  console.error("duplicates", { dupIds, dupDesc: dupDesc.length });
  process.exit(1);
}

const ranks = built.filter((item) => item.bestsellerRank).map((item) => item.bestsellerRank);
const rankSet = new Set(ranks);
if (rankSet.size !== 20 || ranks.length !== 20) {
  console.error("expected 20 unique ranks", ranks.sort((a, b) => a - b));
  process.exit(1);
}

console.log(JSON.stringify({ count: built.length, ranks: [...rankSet].sort((a, b) => a - b) }));

import { writeFileSync } from "node:fs";
writeFileSync(new URL("../src/data/squishies.json", import.meta.url), JSON.stringify(built, null, 2));
