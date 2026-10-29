import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

export default function handler(req, res) {
  try {
    const serverFile = path.join(__dirname, 'backend', 'server.js');
    const app = require(serverFile);
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      dirname: __dirname,
      stack: err.stack
    });
  }
}
