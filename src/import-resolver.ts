import path from 'path';
import fs from 'fs/promises';
import { Graph } from './graph';
import { parser, generate } from '@shaderfrog/glsl-parser';
import { visit, type ImportStatementNode, type Program } from '@shaderfrog/glsl-parser/ast';

export class ImportResolver {
  private graph: Graph<string> = new Graph();

  static async resolve(filePath: string): Promise<string> {
    filePath = path.resolve(filePath);
    const importGraph = new ImportResolver();
    await importGraph.buildImportGraph(filePath);
    await importGraph.reserverRootFileFunctions(filePath);
    return await importGraph.combineFiles(filePath);
  }

  private async reserverRootFileFunctions(filePath: string) {
    const content = await fs.readFile(filePath, 'utf-8');
    const ast = parser.parse(content);

    visit(ast, {
      function_header: {
        enter: (path) => {
          this.reservedNames.set(path.node.name.identifier, filePath);
        },
      },
    });
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

  private getFunctionName(functionName: string, functionOriginfilePath: string) {
    const stem = path.basename(functionOriginfilePath, path.extname(functionOriginfilePath));
    const fileId = this.getFileId(functionOriginfilePath);
    const uniqueName = `${stem}_${functionName}_${fileId}`;

    const reservedBy = this.reservedNames.get(functionName);

    if (reservedBy === undefined) {
      this.reservedNames.set(functionName, functionOriginfilePath);
      return functionName;
    } else if (reservedBy === functionOriginfilePath) {
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

    visit(ast, {
      function_call: {
        enter: (path) => {
          let importName: string | undefined;
          let originalFunctionName: string | undefined;

          if (path.node.type !== 'function_call') {
            return;
          }

          if (path.node.identifier.type !== 'postfix') {
            return;
          }

          const expression = path.node.identifier.expression;
          const postfix = path.node.identifier.postfix;

          // Check expression
          if (expression.type !== 'type_specifier') {
            return;
          }

          if (!('identifier' in expression.specifier)) {
            return;
          }

          if (typeof expression.specifier.identifier !== 'string') {
            return;
          }

          // Check postfix
          if (postfix.type !== 'field_selection') {
            return;
          }

          if (!('identifier' in postfix.selection)) {
            return;
          }

          if (typeof postfix.selection.identifier !== 'string') {
            return;
          }

          importName = expression.specifier.identifier;
          originalFunctionName = postfix.selection.identifier;

          const importPath = imports.find((importData) => importData.importName === importName)?.importPath;

          if (!importPath) {
            return;
          }

          const newFunctionName = this.getFunctionName(originalFunctionName, importPath);

          path.replaceWith({
            type: 'function_call',
            lp: path.node.lp,
            rp: path.node.rp,
            args: path.node.args,
            identifier: {
              type: 'type_specifier',
              specifier: {
                type: 'type_name',
                identifier: newFunctionName,
                whitespace: '',
              },
              quantifier: null,
            },
          });
        },
      },
    });

    // Rename function declarations
    visit(ast, {
      function_header: {
        enter: (path) => {
          const functionName = path.node.name.identifier;
          const newFunctionName = this.getFunctionName(functionName, filePath);
          path.node.name.identifier = newFunctionName;
        },
      },
    });

    return generate(ast);
  }

  private getAbsolutePath(filePath: string, parentPath: string): string {
    if (filePath.startsWith('.')) {
      return path.resolve(path.dirname(parentPath), filePath);
    }

    return filePath;
  }
}
