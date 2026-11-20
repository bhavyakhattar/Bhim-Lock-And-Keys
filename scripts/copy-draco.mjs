import { cpSync, mkdirSync } from "node:fs";
mkdirSync("public/draco", { recursive: true });
cpSync("node_modules/three/examples/jsm/libs/draco/gltf", "public/draco", {
  recursive: true,
});
