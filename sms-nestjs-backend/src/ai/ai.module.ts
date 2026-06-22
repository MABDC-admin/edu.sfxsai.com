import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiToolContextService } from './ai-tool-context.service';

@Module({
  controllers: [AiController],
  providers: [AiService, AiToolContextService],
  exports: [AiService],
})
export class AiModule {}
