import path from 'path';
import fs from 'fs/promises';
import { Graph } from './graph';
import { parser, generate } from '@shaderfrog/glsl-parser';
import { renameFunctions } from '@shaderfrog/glsl-parser/parser/utils';
import type { ImportStatementNode, Program } from '@shaderfrog/glsl-parser/ast';

export class ImportResolver {
  private graph: Graph<string> = new Graph();

  static async resolve(filePath: string): Promise<string> {
    const importGraph = new ImportResolver();
    await importGraph.buildImportGraph(filePath);
    return await importGraph.combineFiles(filePath);
  }

  async buildImportGraph(filePath: string): Promise<Graph<string>> {
    const ast = parser.parse(await fs.readFile(filePath, 'utf-8'));
    const neighbors = await this.getImports(ast, filePath).map((importData) => importData.importPath);

    for (const neighbor of neighbors) {
      this.graph.addEdge(filePath, neighbor);

      if (this.graph.hasCycle()) {
        throw new Error(`Cycle detected in import graph`);
      }

      await this.buildImportGraph(neighbor);
    }

    return this.graph;
  }

  async combineFiles(node: string, visited: Set<string> = new Set()): Promise<string> {
    let output = '';

    if (visited.has(node)) {
      return output;
    }

    visited.add(node);

    const neighbors = this.graph.getNeighbors(node);
    for (const neighbor of neighbors) {
      output += await this.combineFiles(neighbor, visited);
    }

    output += await this.getFileContent(node);
    return output;
  }

  private fileId = 1;
  private fileIds: Map<string, number> = new Map();

  private getFileId(filePath: string): number {
    const fileId = this.fileIds.get(filePath);

    if (fileId) {
      return fileId;
    }

    this.fileIds.set(filePath, this.fileId);
    return this.fileId++;
  }

  private reservedNames: Map<string, string> = new Map();

  private getFunctionName(functionName: string, filePath: string) {
    const stem = path.basename(filePath, path.extname(filePath));
    const fileId = this.getFileId(filePath);
    const uniqueName = `${stem}_${functionName}_${fileId}`;

    const reservedBy = this.reservedNames.get(functionName);

    if (reservedBy === undefined) {
      this.reservedNames.set(functionName, filePath);
      return functionName;
    } else if (reservedBy === filePath) {
      return functionName;
    }

    return uniqueName;
  }

  private getImports(
    ast: Program,
    parentPath: string
  ): {
    importName: string;
    importPath: string;
  }[] {
    const importNodes = ast.program.filter((node) => node.type === 'import_statement') as ImportStatementNode[];

    return importNodes.map((node) => ({
      importName: node.name.identifier,
      // TODO: Check the parser to see if we can fix this
      importPath: this.getAbsolutePath(node.path as unknown as string, parentPath),
    }));
  }

  async getFileContent(filePath: string): Promise<string> {
    let content = await fs.readFile(filePath, 'utf-8');

    const ast = parser.parse(content);
    const imports = this.getImports(ast, filePath);

    // Rename functions
    renameFunctions(ast.scopes[0], (name) => this.getFunctionName(name, filePath));
    content = generate(ast);

    // Rename imported functions
    for (const { importName, importPath } of imports) {
      // This regex will match all the function calls from the imported file
      const regex = new RegExp(`${importName}\\.(\\w+)\\(`, 'g');

      let match;

      while (true) {
        match = regex.exec(content);

        if (!match) {
          break;
        }

        const functionName = match[1];
        const newFunctionName = this.getFunctionName(functionName, importPath);

        // Replace all occurrences of the use of the imported function
        content = content.replace(new RegExp(`${importName}\\.${functionName}`, 'g'), newFunctionName);
      }
    }

    return content;
  }

  private getAbsolutePath(filePath: string, parentPath: string): string {
    if (filePath.startsWith('.')) {
      return path.resolve(path.dirname(parentPath), filePath);
    }

    return filePath;
  }
}
