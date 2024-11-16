declare module 'sql.js/dist/sql-wasm.js' {
  interface SqlJsStatic {
    Database: any;
  }
  
  const initSqlJs: (config?: {
    locateFile?: (file: string) => string;
  }) => Promise<SqlJsStatic>;
  
  export default initSqlJs;
}

declare module 'sql.js/dist/sql-wasm.wasm?url' {
  const wasmUrl: string;
  export default wasmUrl;
} 