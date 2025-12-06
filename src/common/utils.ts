import path from "path";

export function getImportRelativePath(dirname: string) { return path.relative(dirname, process.cwd()) }