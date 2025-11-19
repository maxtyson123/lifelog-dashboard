export interface SystemLog {
    id: string;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
    service: string;
    message: string;
}

class SystemLogger {
    private logs: SystemLog[] = [];
    private readonly MAX_LOGS = 100;

    constructor() {
        this.info('System', 'Logger initialized.');
    }

    private add(level: SystemLog['level'], service: string, message: string) {
        const log: SystemLog = {
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString(),
            level,
            service,
            message,
        };

        // Add to start
        this.logs.unshift(log);
        if (this.logs.length > this.MAX_LOGS)
            this.logs.pop();

        // Print to console
        const msg = `[${log.timestamp}] [${log.service}] ${log.message}`;
        switch (level) {
            case 'INFO':
                console.log(msg);
                break;
            case 'WARN':
                console.warn(msg);
                break;
            case 'ERROR':
                console.error(msg);
                break;
            case 'SUCCESS':
                console.log(msg);
                break;
        }
    }

    info(service: string, message: string) { this.add('INFO', service, message); }
    warn(service: string, message: string) { this.add('WARN', service, message); }
    error(service: string, message: string) { this.add('ERROR', service, message); }
    success(service: string, message: string) { this.add('SUCCESS', service, message); }

    getRecent(limit = 50): SystemLog[] {
        return this.logs.slice(0, limit);
    }
}

export const systemLogger = new SystemLogger();