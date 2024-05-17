var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import path from 'path';
import fs from 'fs/promises';
import { Graph } from './graph.js';
import { parser, generate } from '@onegl/glsl-parser';
import { visit } from '@onegl/glsl-parser/ast';
var ImportResolver = /** @class */ (function () {
    function ImportResolver() {
        this.graph = new Graph();
        this.fileId = 1;
        this.fileIds = new Map();
        this.reservedNames = new Map();
    }
    ImportResolver.resolve = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var importGraph;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filePath = path.resolve(filePath);
                        importGraph = new ImportResolver();
                        return [4 /*yield*/, importGraph.buildImportGraph(filePath)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, importGraph.reserverRootFileFunctions(filePath)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, importGraph.combineFiles(filePath)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ImportResolver.prototype.reserverRootFileFunctions = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var content, ast;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs.readFile(filePath, 'utf-8')];
                    case 1:
                        content = _a.sent();
                        ast = parser.parse(content);
                        visit(ast, {
                            function_header: {
                                enter: function (path) {
                                    _this.reservedNames.set(path.node.name.identifier, filePath);
                                },
                            },
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ImportResolver.prototype.buildImportGraph = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var ast, _a, _b, neighbors, _i, neighbors_1, neighbor;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = parser).parse;
                        return [4 /*yield*/, fs.readFile(filePath, 'utf-8')];
                    case 1:
                        ast = _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, this.getImports(ast, filePath).map(function (importData) { return importData.importPath; })];
                    case 2:
                        neighbors = _c.sent();
                        _i = 0, neighbors_1 = neighbors;
                        _c.label = 3;
                    case 3:
                        if (!(_i < neighbors_1.length)) return [3 /*break*/, 6];
                        neighbor = neighbors_1[_i];
                        this.graph.addEdge(filePath, neighbor);
                        if (this.graph.hasCycle()) {
                            throw new Error("Cycle detected in import graph");
                        }
                        return [4 /*yield*/, this.buildImportGraph(neighbor)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, this.graph];
                }
            });
        });
    };
    ImportResolver.prototype.combineFiles = function (node_1) {
        return __awaiter(this, arguments, void 0, function (node, visited) {
            var output, neighbors, _i, neighbors_2, neighbor, _a, _b;
            if (visited === void 0) { visited = new Set(); }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        output = '';
                        if (visited.has(node)) {
                            return [2 /*return*/, output];
                        }
                        visited.add(node);
                        neighbors = this.graph.getNeighbors(node);
                        _i = 0, neighbors_2 = neighbors;
                        _c.label = 1;
                    case 1:
                        if (!(_i < neighbors_2.length)) return [3 /*break*/, 4];
                        neighbor = neighbors_2[_i];
                        _a = output;
                        return [4 /*yield*/, this.combineFiles(neighbor, visited)];
                    case 2:
                        output = _a + _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        _b = output;
                        return [4 /*yield*/, this.getFileContent(node)];
                    case 5:
                        output = _b + _c.sent();
                        return [2 /*return*/, output];
                }
            });
        });
    };
    ImportResolver.prototype.getFileId = function (filePath) {
        var fileId = this.fileIds.get(filePath);
        if (fileId) {
            return fileId;
        }
        this.fileIds.set(filePath, this.fileId);
        return this.fileId++;
    };
    ImportResolver.prototype.getFunctionName = function (functionName, functionOriginfilePath) {
        var stem = path.basename(functionOriginfilePath, path.extname(functionOriginfilePath));
        var fileId = this.getFileId(functionOriginfilePath);
        var uniqueName = "".concat(stem, "_").concat(functionName, "_").concat(fileId);
        var reservedBy = this.reservedNames.get(functionName);
        if (reservedBy === undefined) {
            this.reservedNames.set(functionName, functionOriginfilePath);
            return functionName;
        }
        else if (reservedBy === functionOriginfilePath) {
            return functionName;
        }
        return uniqueName;
    };
    ImportResolver.prototype.getImports = function (ast, parentPath) {
        var _this = this;
        var importNodes = ast.program.filter(function (node) { return node.type === 'import_statement'; });
        return importNodes.map(function (node) { return ({
            importName: node.name.identifier,
            // TODO: Check the parser to see if we can fix this
            importPath: _this.getAbsolutePath(node.path, parentPath),
        }); });
    };
    ImportResolver.prototype.getFileContent = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var content, ast, imports;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs.readFile(filePath, 'utf-8')];
                    case 1:
                        content = _a.sent();
                        ast = parser.parse(content);
                        imports = this.getImports(ast, filePath);
                        visit(ast, {
                            function_call: {
                                enter: function (path) {
                                    var _a;
                                    var importName;
                                    var originalFunctionName;
                                    if (path.node.type !== 'function_call') {
                                        return;
                                    }
                                    if (path.node.identifier.type !== 'postfix') {
                                        return;
                                    }
                                    var expression = path.node.identifier.expression;
                                    var postfix = path.node.identifier.postfix;
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
                                    var importPath = (_a = imports.find(function (importData) { return importData.importName === importName; })) === null || _a === void 0 ? void 0 : _a.importPath;
                                    if (!importPath) {
                                        return;
                                    }
                                    var newFunctionName = _this.getFunctionName(originalFunctionName, importPath);
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
                                enter: function (path) {
                                    var functionName = path.node.name.identifier;
                                    var newFunctionName = _this.getFunctionName(functionName, filePath);
                                    path.node.name.identifier = newFunctionName;
                                },
                            },
                        });
                        return [2 /*return*/, generate(ast)];
                }
            });
        });
    };
    ImportResolver.prototype.getAbsolutePath = function (filePath, parentPath) {
        if (filePath.startsWith('.')) {
            return path.resolve(path.dirname(parentPath), filePath);
        }
        return filePath;
    };
    return ImportResolver;
}());
export { ImportResolver };
