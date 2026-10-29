import server from './backend/server.js';

export default function handler(req, res) {
  return server(req, res);
}
