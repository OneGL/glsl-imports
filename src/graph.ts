export class Graph<T> {
  private adjList: Map<T, T[]>;

  constructor() {
    this.adjList = new Map();
  }

  addEdge(src: T, dest: T): void {
    const neighbors = this.adjList.get(src);

    if (neighbors) {
      neighbors.push(dest);
    } else {
      this.adjList.set(src, [dest]);
    }
  }

  getNeighbors(node: T): T[] {
    return this.adjList.get(node) || [];
  }

  private dfs(node: T, visited: Set<T>, recStack: Set<T>): boolean {
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

  hasCycle(): boolean {
    const visited = new Set<T>();
    const recStack = new Set<T>();

    for (const node of this.adjList.keys()) {
      if (this.dfs(node, visited, recStack)) {
        return true;
      }
    }

    return false;
  }
}
