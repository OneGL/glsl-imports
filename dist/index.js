export { ErrorManager } from './error-manager';
export { ImportResolver } from './import-resolver';
// import { ErrorManager } from './error-manager';
// import { ImportResolver } from './import-resolver';
// async function main() {
//   const inputFilePath = './example/input.vert';
//   const output = await ImportResolver.resolve(inputFilePath);
//   console.log('\n\n');
//   console.log(output);
//   const erros = await ErrorManager.checkSource(output, 'vert');
//   // Erros has the line number and the message
//   // We will take the output and modify the lines with errors to add the error message at the end
//   const lines = output.split('\n');
//   for (const error of erros) {
//     lines[error.line - 1] = `${lines[error.line - 1]} \x1b[31m${error.message}\x1b[0m`;
//   }
//   console.log('\n\n');
//   console.log(lines.join('\n'));
//   // You can write the output to a file
//   console.log('Errors:', erros);
// }
// main();
//# sourceMappingURL=index.js.map