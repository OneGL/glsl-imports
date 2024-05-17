import path from 'path';
import fs from 'fs/promises';
import { Graph } from './graph';
import { parser, generate } from '@onegl/glsl-parser';
import { visit } from '@onegl/glsl-parser/ast';
export class ImportResolver {
    constructor() {
        Object.defineProperty(this, "graph", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Graph()
        });
        Object.defineProperty(this, "fileId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "fileIds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "reservedNames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    static async resolve(filePath) {
        filePath = path.resolve(filePath);
        const importGraph = new ImportResolver();
        await importGraph.buildImportGraph(filePath);
        await importGraph.reserverRootFileFunctions(filePath);
        return await importGraph.combineFiles(filePath);
    }
    async reserverRootFileFunctions(filePath) {
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
    async buildImportGraph(filePath) {
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
    async combineFiles(node, visited = new Set()) {
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
    getFileId(filePath) {
        const fileId = this.fileIds.get(filePath);
        if (fileId) {
            return fileId;
        }
        this.fileIds.set(filePath, this.fileId);
        return this.fileId++;
    }
    getFunctionName(functionName, functionOriginfilePath) {
        const stem = path.basename(functionOriginfilePath, path.extname(functionOriginfilePath));
        const fileId = this.getFileId(functionOriginfilePath);
        const uniqueName = `${stem}_${functionName}_${fileId}`;
        const reservedBy = this.reservedNames.get(functionName);
        if (reservedBy === undefined) {
            this.reservedNames.set(functionName, functionOriginfilePath);
            return functionName;
        }
        else if (reservedBy === functionOriginfilePath) {
            return functionName;
        }
        return uniqueName;
    }
    getImports(ast, parentPath) {
        const importNodes = ast.program.filter((node) => node.type === 'import_statement');
        return importNodes.map((node) => ({
            importName: node.name.identifier,
            // TODO: Check the parser to see if we can fix this
            importPath: this.getAbsolutePath(node.path, parentPath),
        }));
    }
    async getFileContent(filePath) {
        let content = await fs.readFile(filePath, 'utf-8');
        const ast = parser.parse(content);
        const imports = this.getImports(ast, filePath);
        visit(ast, {
            function_call: {
                enter: (path) => {
                    let importName;
                    let originalFunctionName;
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
    getAbsolutePath(filePath, parentPath) {
        if (filePath.startsWith('.')) {
            return path.resolve(path.dirname(parentPath), filePath);
        }
        return filePath;
    }
}
//# sourceMappingURL=import-resolver.js.map