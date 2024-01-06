import { createSQLiteThread, createHttpBackend } from "sqlite-wasm-http";

// Create an HTTP backend to support the SQLite thread
const backend = createHttpBackend();

export async function getTokenName(tokenAddress) {
    // Create a new SQLite thread with HTTP support
    const workerPromiser = await createSQLiteThread({
        http: backend
    });

    // Open the SQLite database via HTTP
    await workerPromiser('open', {
        filename: "https://ipfs.io/ipfs/bafybeieluiest3gtccszqh6bymzs6r4gn62wsh2uznom2pqb2tqt54ef7i/sepolia.db",
        vfs: 'http'
    });

    // Prepare and execute the query
    const results = await workerPromiser('exec', {
        sql: "SELECT name FROM tokens WHERE address = ?",
        bind: [tokenAddress]
    });

    // As we're using 'exec', the results should already be an array of result objects
    const tokenName = (results.length > 0 && results[0].values.length > 0) ? results[0].values[0][0] : undefined;

    // Close the SQLite database
    await workerPromiser('close');

    return tokenName;
}
