import { ImportResolver } from './import-resolver';

async function main() {
  const output = await ImportResolver.resolve('./example/input.txt');
  console.log(output);
}

main();
