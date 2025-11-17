export const CONFIG = {
    PORT: 3001,
    NAS_PATH: process.env.NAS_PATH || '/mnt/nas/lifelog', // Mount point for NAS
    INDEX_DB_PATH: './data/index.sqlite',
    LOG_FILE_PATH: './data/server.log',
};