import { Graph } from './graph';
export declare class ImportResolver {
    private graph;
    static resolve(filePath: string): Promise<string>;
    private reserverRootFileFunctions;
    buildImportGraph(filePath: string): Promise<Graph<string>>;
    combineFiles(node: string, visited?: Set<string>): Promise<string>;
    private fileId;
    private fileIds;
    private getFileId;
    private reservedNames;
    private getFunctionName;
    private getImports;
    getFileContent(filePath: string): Promise<string>;
    private getAbsolutePath;
}
//# sourceMappingURL=import-resolver.d.ts.map