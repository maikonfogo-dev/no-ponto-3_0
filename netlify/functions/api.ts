import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../backend/src/app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';

let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS
  app.enableCors();
  
  // Set global prefix if needed (but netlify rewrite handles /api/* -> /api/...)
  // If the rewrite is /api/* -> /.netlify/functions/api/:splat
  // And the function is named 'api'
  // Then the request path seen by the function might be /auth/login or /api/auth/login depending on Netlify version.
  // With serverless-express, it usually preserves the path.
  // To be safe, let's just log the path in dev if needed, or assume standard behavior.
  
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
