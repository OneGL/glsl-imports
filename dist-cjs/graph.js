"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graph = void 0;
class Graph {
    constructor() {
        Object.defineProperty(this, "adjList", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.adjList = new Map();
    }
    addEdge(src, dest) {
        const neighbors = this.adjList.get(src);
        if (neighbors) {
            neighbors.push(dest);
        }
        else {
            this.adjList.set(src, [dest]);
        }
    }
    getNeighbors(node) {
        return this.adjList.get(node) || [];
    }
    dfs(node, visited, recStack) {
        if (recStack.has(node)) {
            return true;
        }
        if (visited.has(node)) {
            return false;
        }
        visited.add(node);
        recStack.add(node);
        const neighbors = this.adjList.get(node) || [];
        for (const neighbor of neighbors) {
            if (this.dfs(neighbor, visited, recStack)) {
                return true;
            }
        }
        recStack.delete(node);
        return false;
    }
    hasCycle() {
        const visited = new Set();
        const recStack = new Set();
        for (const node of this.adjList.keys()) {
            if (this.dfs(node, visited, recStack)) {
                return true;
            }
        }
        return false;
    }
}
exports.Graph = Graph;
//# sourceMappingURL=graph.js.map