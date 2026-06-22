import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { AiService } from './ai.service';
import type { AiChatRequest, AiImageRequest } from './ai.service';
import type { Response } from 'express';

@Controller('ai')
@Roles('ADMIN', 'REGISTRAR', 'FINANCE', 'PRINCIPAL', 'TEACHER')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  chat(@Body() body: AiChatRequest, @Req() req: { user: { userId: string; email: string; role: string } }) {
    return this.aiService.chat(req.user, body);
  }

  @Post('image')
  generateImage(@Body() body: AiImageRequest, @Req() req: { user: { userId: string; email: string; role: string } }) {
    return this.aiService.generateImage(req.user, body);
  }

  @Post('chat/stream')
  async chatStream(
    @Body() body: AiChatRequest,
    @Req() req: { user: { userId: string; email: string; role: string } },
    @Res() res: Response,
  ) {
    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    (res as any).flushHeaders?.();

    try {
      await this.aiService.streamChat(req.user, body, (token) => res.write(token));
      res.end();
    } catch {
      if (!res.headersSent) {
        res.status(503).json({ message: 'AI assistant stream is temporarily unavailable.' });
        return;
      }
      res.write('\n\nAI assistant stream was interrupted. Please try again.');
      res.end();
    }
  }

}
