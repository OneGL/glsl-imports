import { ImportResolver } from './import-resolver';

async function main() {
  const inputFilePath = './example/input.glsl';
  const output = await ImportResolver.resolve(inputFilePath);
  console.log("\n\n")
  console.log(output);
}

main();
