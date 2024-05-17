var Graph = /** @class */ (function () {
    function Graph() {
        this.adjList = new Map();
    }
    Graph.prototype.addEdge = function (src, dest) {
        var neighbors = this.adjList.get(src);
        if (neighbors) {
            neighbors.push(dest);
        }
        else {
            this.adjList.set(src, [dest]);
        }
    };
    Graph.prototype.getNeighbors = function (node) {
        return this.adjList.get(node) || [];
    };
    Graph.prototype.dfs = function (node, visited, recStack) {
        if (recStack.has(node)) {
            return true;
        }
        if (visited.has(node)) {
            return false;
        }
        visited.add(node);
        recStack.add(node);
        var neighbors = this.adjList.get(node) || [];
        for (var _i = 0, neighbors_1 = neighbors; _i < neighbors_1.length; _i++) {
            var neighbor = neighbors_1[_i];
            if (this.dfs(neighbor, visited, recStack)) {
                return true;
            }
        }
        recStack.delete(node);
        return false;
    };
    Graph.prototype.hasCycle = function () {
        var visited = new Set();
        var recStack = new Set();
        var nodes = Array.from(this.adjList.keys());
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            if (this.dfs(node, visited, recStack)) {
                return true;
            }
        }
        return false;
    };
    return Graph;
}());
export { Graph };
