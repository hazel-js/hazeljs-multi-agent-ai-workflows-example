import { HazelApp } from '@hazeljs/core';
import { StreamingServerModule } from './streaming-server';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Bootstrap HazelJS Server with SSE Streaming Support
 */

async function bootstrap() {
  const app = new HazelApp(StreamingServerModule);

  // Enable CORS for the demo
  app.enableCors();

  // Serve the streaming demo HTML
  app.get('/streaming-demo.html', (req: any, res: any) => {
    // Resolve from project root (when running with ts-node, __dirname is src/server)
    const filePath = path.resolve(process.cwd(), 'public/streaming-demo.html');
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
      res.end();
    } else {
      res.status(404);
      res.json({ error: `File not found: ${filePath}` });
    }
  });

  // Start the server
  await app.listen(3000);

  console.log('');
  console.log('🚀 HazelJS Agent Streaming Server');
  console.log('================================');
  console.log('');
  console.log('📡 Server running on: http://localhost:3000');
  console.log('🎨 Demo UI: http://localhost:3000/streaming-demo.html');
  console.log('🔌 SSE Endpoint: http://localhost:3000/api/stream');
  console.log('💚 Health Check: http://localhost:3000/api/health');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
