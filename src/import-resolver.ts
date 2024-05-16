import path from 'path';
import fs from 'fs/promises';
import { Graph } from './graph';

export class ImportResolver {
  private graph: Graph<string> = new Graph();

  static async resolve(filePath: string): Promise<string> {
    const importGraph = new ImportResolver();
    await importGraph.buildImportGraph(filePath);
    return await importGraph.combineFiles(filePath);
  }

  async buildImportGraph(filePath: string): Promise<Graph<string>> {
    const neighbors = await this.getFileImports(filePath);

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

    const content = await fs.readFile(node, 'utf-8');
    output += content;

    return output;
  }

  private getAbsolutePath(filePath: string, parentPath: string): string {
    if (filePath.startsWith('.')) {
      return path.resolve(path.dirname(parentPath), filePath);
    }

    return filePath;
  }

  private async getFileImports(filePath: string): Promise<string[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const imports: string[] = [];

    for (const line of lines) {
      if (line.trim().startsWith('import')) {
        const importPath = line.split(' ')[3];

        if (!importPath) {
          console.warn(`Invalid import statement in file: ${filePath}.\n${line}`);
          continue;
        }

        imports.push(this.getAbsolutePath(importPath, filePath));
      }
    }

    return imports;
  }
}
