import { ImportGraph } from './import-graph';

async function main() {
  const inputFile = './example/input.txt';
  const importGraph = new ImportGraph();
  await importGraph.buildImportGraph(inputFile);
  const output = await importGraph.combineFiles(inputFile);
  console.log(output);
}

main();
