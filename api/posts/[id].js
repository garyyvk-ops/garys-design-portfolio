import { config, handle } from '../_worker.js';

export { config };

export default function handler(request) {
  return handle(request);
}
