import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default function handler(req, res) {
  try {
    const serverPath = './backend/server';
    const app = require(serverPath);
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
}
