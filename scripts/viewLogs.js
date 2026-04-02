/**
 * Log Viewer Script
 * View and filter production logs
 * Usage: node scripts/viewLogs.js [options]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logsDir = path.join(process.cwd(), 'logs');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  type: 'combined', // combined, error, api
  lines: 50,
  level: null, // error, warn, info, http, debug
  search: null,
  date: null, // YYYY-MM-DD
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--type' || arg === '-t') {
    options.type = args[++i];
  } else if (arg === '--lines' || arg === '-n') {
    options.lines = parseInt(args[++i]);
  } else if (arg === '--level' || arg === '-l') {
    options.level = args[++i];
  } else if (arg === '--search' || arg === '-s') {
    options.search = args[++i];
  } else if (arg === '--date' || arg === '-d') {
    options.date = args[++i];
  } else if (arg === '--help' || arg === '-h') {
    showHelp();
    process.exit(0);
  }
}

function showHelp() {
  console.log(`
📋 Log Viewer - View and filter production logs

Usage: node scripts/viewLogs.js [options]

Options:
  -t, --type <type>      Log type: combined, error, api (default: combined)
  -n, --lines <number>   Number of lines to show (default: 50)
  -l, --level <level>    Filter by level: error, warn, info, http, debug
  -s, --search <text>    Search for text in logs
  -d, --date <date>      View logs for specific date (YYYY-MM-DD)
  -h, --help             Show this help message

Examples:
  node scripts/viewLogs.js                           # View last 50 lines of combined logs
  node scripts/viewLogs.js -t error -n 100           # View last 100 error logs
  node scripts/viewLogs.js -l error                  # View only error level logs
  node scripts/viewLogs.js -s "login_failed"         # Search for login failures
  node scripts/viewLogs.js -d 2024-01-15             # View logs for specific date
  node scripts/viewLogs.js -t api -l http -n 200     # View last 200 API requests
  `);
}

async function viewLogs() {
  // Check if logs directory exists
  if (!fs.existsSync(logsDir)) {
    console.error('❌ Logs directory not found. No logs available.');
    console.log('💡 Logs are only created in production mode.');
    process.exit(1);
  }

  // Determine log file
  const date = options.date || new Date().toISOString().split('T')[0];
  const filename = `${options.type}-${date}.log`;
  const filepath = path.join(logsDir, filename);

  // Check if log file exists
  if (!fs.existsSync(filepath)) {
    console.error(`❌ Log file not found: ${filename}`);
    console.log(`💡 Available log files:`);
    
    const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.log'));
    if (files.length === 0) {
      console.log('   No log files found.');
    } else {
      files.forEach(f => console.log(`   - ${f}`));
    }
    process.exit(1);
  }

  console.log(`📋 Viewing: ${filename}`);
  console.log(`🔍 Filters: ${JSON.stringify(options, null, 2)}\n`);

  // Read and filter logs
  const logs = [];
  const fileStream = fs.createReadStream(filepath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const log = JSON.parse(line);

      // Apply filters
      if (options.level && log.level !== options.level) continue;
      if (options.search && !line.toLowerCase().includes(options.search.toLowerCase())) continue;

      logs.push(log);
    } catch (error) {
      // Skip invalid JSON lines
    }
  }

  // Get last N lines
  const displayLogs = logs.slice(-options.lines);

  if (displayLogs.length === 0) {
    console.log('📭 No logs found matching the filters.');
    process.exit(0);
  }

  // Display logs
  console.log(`📊 Showing ${displayLogs.length} of ${logs.length} total logs:\n`);

  displayLogs.forEach((log, index) => {
    const levelColors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m',  // Yellow
      info: '\x1b[32m',  // Green
      http: '\x1b[35m',  // Magenta
      debug: '\x1b[36m', // Cyan
    };

    const color = levelColors[log.level] || '\x1b[0m';
    const reset = '\x1b[0m';

    console.log(`${color}[${log.timestamp}] [${log.level.toUpperCase()}]${reset} ${log.message}`);
    
    // Display metadata
    const { timestamp, level, message, stack, ...meta } = log;
    if (Object.keys(meta).length > 0) {
      console.log(`  ${JSON.stringify(meta, null, 2)}`);
    }

    // Display stack trace for errors
    if (stack) {
      console.log(`  Stack: ${stack.split('\n')[0]}`);
    }

    console.log('');
  });

  console.log(`\n✅ Displayed ${displayLogs.length} log entries`);
}

// Run the viewer
viewLogs().catch(error => {
  console.error('❌ Error viewing logs:', error.message);
  process.exit(1);
});
