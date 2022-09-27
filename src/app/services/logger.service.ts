import {Injectable} from '@angular/core';
import {LogLevel} from './log-level.enum';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  public static logLevel: LogLevel = LogLevel.DEBUG;

  public static debug(...message: any): void {
    LoggerService.writeToLog(LogLevel.DEBUG, ...message);
  }

  public static log(...message: any) {
    LoggerService.writeToLog(LogLevel.INFO, ...message);
  }

  public static warn(...message: any) {
    LoggerService.writeToLog(LogLevel.WARN, ...message);
  }

  public static error(...message: any) {
    LoggerService.writeToLog(LogLevel.ERROR, ...message);
  }

  private static shouldLog(level: LogLevel): boolean {
    return (level >= LoggerService.logLevel);
  }

  private static writeToLog(level: LogLevel, ...message: any) {
    if (this.shouldLog(level)) {
      if (level <= LogLevel.INFO) {
        console.log(LoggerService.getLogDate(), ...message);
      } else if (level === LogLevel.ERROR) {
        console.error(LoggerService.getLogDate(), ...message);
      } else if (level === LogLevel.WARN) {
        console.warn(LoggerService.getLogDate(), ...message);
      }
    }
  }

  private static getLogDate(): string {
    const date = new Date();
    return '[' +
      date.getUTCFullYear() + '/' +
      (date.getUTCMonth() + 1) + '/' +
      date.getUTCDate() + ' ' +
      date.getUTCHours() + ':' +
      date.getUTCMinutes() + ':' +
      date.getUTCSeconds() + '.' +
      date.getMilliseconds() + ']';
  }
}
