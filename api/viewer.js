import { handleViewerRequest } from './_worker.js';

export default async function handler(req, res) {
  const response = await handleViewerRequest(req);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  res.end(buffer);
}
