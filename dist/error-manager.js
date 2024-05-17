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
import * as path from 'path';
import { platform } from 'os';
import { Stream } from 'stream';
import { exec } from 'child_process';
import { FRAGMENT_EXTS, VERTEX_EXTS } from './constants.js';
var ErrorManager = /** @class */ (function () {
    function ErrorManager() {
    }
    ErrorManager.checkSource = function (content, stage) {
        return __awaiter(this, void 0, void 0, function () {
            var platformName, base, validatorPath, result, errors, stdinStream;
            var _this = this;
            return __generator(this, function (_a) {
                platformName = this.getPlatformName();
                base = path.resolve(__dirname, '..');
                validatorPath = path.join(base, 'bin', "glslangValidator".concat(platformName));
                result = exec("".concat(validatorPath, " --stdin -C -S ").concat(stage));
                if (!result.stdout || !result.stdin) {
                    return [2 /*return*/, []];
                }
                errors = [];
                // Handle errors from the validator
                result.stdout.on('data', function (data) {
                    var linesWithErrors = _this.getLinesWithErrors(data);
                    errors.push.apply(errors, linesWithErrors.map(_this.getErrorData));
                });
                stdinStream = new Stream.Readable();
                stdinStream.push(content);
                stdinStream.push(null);
                stdinStream.pipe(result.stdin);
                return [2 /*return*/, new Promise(function (resolve) {
                        result.on('close', function () {
                            resolve(errors);
                        });
                    })];
            });
        });
    };
    ErrorManager.getErrorData = function (row) {
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
        var colonIndex = row.indexOf(':');
        var line = Number(row.substring(0, colonIndex));
        var message = row.substring(colonIndex + 1).trim();
        return { line: line, message: message };
    };
    ErrorManager.getStageName = function (filePath) {
        var _a = path.extname(filePath).split('.'), ext1 = _a[0], ext2 = _a[1];
        if (VERTEX_EXTS.includes(ext1) || VERTEX_EXTS.includes(ext2)) {
            return 'vert';
        }
        if (FRAGMENT_EXTS.includes(ext1) || FRAGMENT_EXTS.includes(ext2)) {
            return 'frag';
        }
        throw new Error('Unsupported file extension');
    };
    ErrorManager.getLinesWithErrors = function (data) {
        var rows = data.split('\n');
        var results = [];
        for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
            var row = rows_1[_i];
            if (row.startsWith('ERROR: ') || row.startsWith('WARNING: ')) {
                results.push(row);
            }
        }
        return results;
    };
    ErrorManager.getPlatformName = function () {
        switch (platform()) {
            case 'win32':
                return 'Windows';
            case 'linux':
                return 'Linux';
            case 'darwin':
                return 'Mac';
            default:
                throw new Error('Unsupported platform');
        }
    };
    return ErrorManager;
}());
export { ErrorManager };
