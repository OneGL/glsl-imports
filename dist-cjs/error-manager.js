"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorManager = void 0;
const path = __importStar(require("path"));
const os_1 = require("os");
const stream_1 = require("stream");
const child_process_1 = require("child_process");
const constants_1 = require("./constants");
class ErrorManager {
    static async checkSource(content, stage) {
        const platformName = this.getPlatformName();
        // Base is the path where this file is located
        const base = path.resolve(__dirname, '..');
        const validatorPath = path.join(base, 'bin', `glslangValidator${platformName}`);
        const result = (0, child_process_1.exec)(`${validatorPath} --stdin -C -S ${stage}`);
        if (!result.stdout || !result.stdin) {
            return [];
        }
        const errors = [];
        // Handle errors from the validator
        result.stdout.on('data', (data) => {
            const linesWithErrors = this.getLinesWithErrors(data);
            errors.push(...linesWithErrors.map(this.getErrorData));
        });
        // Stream the file content to the validator
        const stdinStream = new stream_1.Stream.Readable();
        stdinStream.push(content);
        stdinStream.push(null);
        stdinStream.pipe(result.stdin);
        return new Promise((resolve) => {
            result.on('close', () => {
                resolve(errors);
            });
        });
    }
    static getErrorData(row) {
        // Remove the error or warning prefix
        if (row.startsWith('ERROR: 0:')) {
            row = row.substring(9);
        }
        else if (row.startsWith('WARNING: 0:')) {
            row = row.substring(11);
        }
        else {
            return { line: -1, message: row };
        }
        // Find the line number
        const colonIndex = row.indexOf(':');
        const line = Number(row.substring(0, colonIndex));
        const message = row.substring(colonIndex + 1).trim();
        return { line, message };
    }
    static getStageName(filePath) {
        const [ext1, ext2] = path.extname(filePath).split('.');
        if (constants_1.VERTEX_EXTS.includes(ext1) || constants_1.VERTEX_EXTS.includes(ext2)) {
            return 'vert';
        }
        if (constants_1.FRAGMENT_EXTS.includes(ext1) || constants_1.FRAGMENT_EXTS.includes(ext2)) {
            return 'frag';
        }
        throw new Error('Unsupported file extension');
    }
    static getLinesWithErrors(data) {
        const rows = data.split('\n');
        const results = [];
        for (const row of rows) {
            if (row.startsWith('ERROR: ') || row.startsWith('WARNING: ')) {
                results.push(row);
            }
        }
        return results;
    }
    static getPlatformName() {
        switch ((0, os_1.platform)()) {
            case 'win32':
                return 'Windows';
            case 'linux':
                return 'Linux';
            case 'darwin':
                return 'Mac';
            default:
                throw new Error('Unsupported platform');
        }
    }
}
exports.ErrorManager = ErrorManager;
//# sourceMappingURL=error-manager.js.map