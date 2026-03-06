import pino from 'pino';

export function createLogger(level: pino.LevelWithSilent): pino.Logger {
  return pino({
    level,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}
