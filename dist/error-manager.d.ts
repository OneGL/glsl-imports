type ErrorData = {
    line: number;
    message: string;
};
export declare class ErrorManager {
    static checkSource(content: string, stage: string): Promise<ErrorData[]>;
    static getErrorData(row: string): {
        line: number;
        message: string;
    };
    static getStageName(filePath: string): string;
    static getLinesWithErrors(data: string): string[];
    static getPlatformName(): string;
}
export {};
