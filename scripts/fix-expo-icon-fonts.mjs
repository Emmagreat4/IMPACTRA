
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

const sourceFonts = path.join(
  root,
  "node_modules",
  "@expo",
  "vector-icons",
  "build",
  "vendor",
  "react-native-vector-icons",
  "Fonts"
);

const publicFonts = path.join(dist, "Fonts");

if (!fs.existsSync(dist)) {
  throw new Error("The dist folder was not found. Run the web export first.");
}

if (!fs.existsSync(sourceFonts)) {
  throw new Error(`Icon font folder not found: ${sourceFonts}`);
}

fs.mkdirSync(publicFonts, { recursive: true });

const textExtensions = new Set([".js", ".css", ".html", ".json"]);
const fontPattern =
  /\/?assets\/node_modules\/@expo\/vector-icons\/build\/vendor\/react-native-vector-icons\/Fonts\/([^"'\\\s)]+?\.ttf)/g;

let rewrittenFiles = 0;
const copiedFonts = new Set();

function walk(directory) {
  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!textExtensions.has(path.extname(entry.name))) {
      continue;
    }

    const original = fs.readFileSync(fullPath, "utf8");

    const updated = original.replace(
      fontPattern,
      (reference, bundledName) => {
        const plainName = bundledName.replace(
          /\.[a-f0-9]{8,}\.ttf$/i,
          ".ttf"
        );

        const source = path.join(sourceFonts, plainName);
        const destination = path.join(publicFonts, plainName);

        if (!fs.existsSync(source)) {
          throw new Error(`Original icon font not found: ${source}`);
        }

        if (!fs.existsSync(destination)) {
          fs.copyFileSync(source, destination);
        }

        copiedFonts.add(plainName);
        return `/Fonts/${plainName}`;
      }
    );

    if (updated !== original) {
      fs.writeFileSync(fullPath, updated, "utf8");
      rewrittenFiles++;
    }
  }
}

walk(dist);

if (copiedFonts.size === 0) {
  throw new Error(
    "No Expo icon font references were found in the web export."
  );
}

console.log(`Updated ${rewrittenFiles} built files.`);
console.log(`Copied ${copiedFonts.size} icon fonts:`);
for (const font of copiedFonts) {
  console.log(`- ${font}`);
}
