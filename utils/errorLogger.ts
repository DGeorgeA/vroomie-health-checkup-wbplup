
import Constants from "expo-constants";
import { Platform } from "react-native";

const FLUSH_INTERVAL = 5000;

let logQueue: { level: string; message: string; source: string; timestamp: string; platform: string }[] = [];

function clearLogAfterDelay(logKey: string) {
  setTimeout(() => {
    try {
      console.log(`Clearing log: ${logKey}`);
    } catch (error) {
      console.error('Error clearing log:', error);
    }
  }, 60000);
}

function getPlatformName(): string {
  return Platform.OS;
}

function getLogServerUrl(): string {
  const expoProjectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (expoProjectId) {
    return `https://api.expo.dev/v2/projects/${expoProjectId}/logs`;
  }
  return '';
}

function flushLogs() {
  if (logQueue.length === 0) {
    return;
  }

  const logsToSend = [...logQueue];
  logQueue = [];

  const serverUrl = getLogServerUrl();
  if (!serverUrl) {
    console.warn('No log server URL configured');
    return;
  }

  fetch(serverUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ logs: logsToSend }),
  }).catch((error) => {
    console.error('Error flushing logs:', error);
  });
}

function queueLog(level: string, message: string, source: string) {
  const timestamp = new Date().toISOString();
  const platform = getPlatformName();

  logQueue.push({
    level,
    message,
    source,
    timestamp,
    platform,
  });

  if (logQueue.length >= 10) {
    flushLogs();
  }
}

function sendErrorToParent(level: string, message: string, data: any) {
  try {
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage(
        {
          type: 'error-log',
          level,
          message,
          data,
          timestamp: new Date().toISOString(),
        },
        '*'
      );
    }
  } catch (error) {
    console.error('Error sending to parent:', error);
  }
}

function extractSourceLocation(stack: string): string {
  try {
    const lines = stack.split('\n');
    if (lines.length > 1) {
      const match = lines[1].match(/\((.+):(\d+):(\d+)\)/);
      if (match) {
        return `${match[1]}:${match[2]}:${match[3]}`;
      }
    }
  } catch (error) {
    console.error('Error extracting source location:', error);
  }
  return 'unknown';
}

function getCallerInfo(): string {
  try {
    const stack = new Error().stack || '';
    return extractSourceLocation(stack);
  } catch (error) {
    console.error('Error getting caller info:', error);
    return 'unknown';
  }
}

function stringifyArgs(args: any[]): string {
  try {
    return args
      .map((arg) => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg);
        }
        return String(arg);
      })
      .join(' ');
  } catch (error) {
    console.error('Error stringifying args:', error);
    return 'Error stringifying arguments';
  }
}

setInterval(flushLogs, FLUSH_INTERVAL);

export {
  queueLog,
  sendErrorToParent,
  extractSourceLocation,
  getCallerInfo,
  stringifyArgs,
  clearLogAfterDelay,
  getPlatformName,
  getLogServerUrl,
  flushLogs,
};
