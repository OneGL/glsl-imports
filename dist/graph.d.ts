export declare class Graph<T> {
    private adjList;
    constructor();
    addEdge(src: T, dest: T): void;
    getNeighbors(node: T): T[];
    private dfs;
    hasCycle(): boolean;
}
