import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/roles.decorator';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

describe('AI chat controller', () => {
  it('limits chat access to staff roles only', () => {
    const reflector = new Reflector();
    expect(reflector.get(ROLES_KEY, AiController)).toEqual(['ADMIN', 'REGISTRAR', 'FINANCE', 'PRINCIPAL', 'TEACHER']);
  });

  it('delegates chat requests to AiService with authenticated user context', async () => {
    const service = { chat: jest.fn().mockResolvedValue({ content: 'Hello teacher' }) } as unknown as AiService;
    const controller = new AiController(service);
    const user = { userId: 'u1', email: 'teacher@sfxsai.com', role: 'TEACHER' };

    await expect(controller.chat({ messages: [{ role: 'user', content: 'Plan a lesson' }] }, { user })).resolves.toEqual({ content: 'Hello teacher' });
    expect((service.chat as jest.Mock).mock.calls[0][0]).toEqual(user);
    expect((service.chat as jest.Mock).mock.calls[0][1].messages[0].content).toBe('Plan a lesson');
  });

  it('exposes a streaming chat endpoint for desktop-like response speed', () => {
    const source = require('fs').readFileSync(require('path').join(__dirname, 'ai.controller.ts'), 'utf8');
    const serviceSource = require('fs').readFileSync(require('path').join(__dirname, 'ai.service.ts'), 'utf8');

    expect(source).toMatch(/@Post\('chat\/stream'\)/);
    expect(source).toMatch(/chatStream/);
    expect(serviceSource).toMatch(/streamChat/);
    expect(serviceSource).toMatch(/stream:\s*true/);
    expect(serviceSource).toMatch(/ReadableStream/);
  });

  it('uses Gemini Flash Lite as the default OpenRouter chat model', () => {
    expect(AiService.OPENROUTER_MODEL).toBe('google/gemini-2.5-flash-lite-preview-09-2025');
  });

  it('allowlists DeepSeek Flash as the dual-chat comparison model', () => {
    const serviceSource = require('fs').readFileSync(require('path').join(__dirname, 'ai.service.ts'), 'utf8');

    expect(AiService.OPENROUTER_COMPARISON_MODEL).toBe('deepseek/deepseek-v4-flash');
    expect(serviceSource).toMatch(/modelSlot\?:\s*'default'\s*\|\s*'comparison'/);
    expect(serviceSource).toMatch(/resolveModel\(/);
    expect(serviceSource).toMatch(/OPENROUTER_COMPARISON_MODEL/);
    expect(serviceSource).not.toMatch(/model:\s*request\.model/);
  });

  it('allowlists Grok Imagine for staff image generation', () => {
    const controllerSource = require('fs').readFileSync(require('path').join(__dirname, 'ai.controller.ts'), 'utf8');
    const serviceSource = require('fs').readFileSync(require('path').join(__dirname, 'ai.service.ts'), 'utf8');

    expect(AiService.OPENROUTER_IMAGE_MODEL).toBe('x-ai/grok-imagine-image-quality');
    expect(controllerSource).toMatch(/@Post\('image'\)/);
    expect(controllerSource).toMatch(/generateImage/);
    expect(serviceSource).toMatch(/generateImage/);
    expect(serviceSource).toMatch(/modalities:\s*\[\s*'image'\s*\]/);
    expect(serviceSource).not.toMatch(/modalities:\s*\[\s*'image'\s*,\s*'text'\s*\]/);
    expect(serviceSource).toMatch(/image_config/);
    expect(serviceSource).toMatch(/OPENROUTER_IMAGE_MODEL/);
    expect(serviceSource).not.toMatch(/imageModel:\s*request\.model/);
  });

  it('keeps the desktop assistant rich-response behavior in the system prompt', () => {
    const serviceSource = require('fs').readFileSync(require('path').join(__dirname, 'ai.service.ts'), 'utf8');

    expect(serviceSource).toMatch(/elite AI assistant/);
    expect(serviceSource).toMatch(/St Francis Xavier Smart Academy Inc/);
    expect(serviceSource).not.toMatch(/M\.A Brain Development Center/);
    expect(serviceSource).toMatch(/GitHub-Flavored Markdown/);
    expect(serviceSource).toMatch(/emojis frequently/);
    expect(serviceSource).toMatch(/comparison tables/);
    expect(serviceSource).toMatch(/## 🚀 Suggestions & Next Steps/);
    expect(serviceSource).toMatch(/Quipper/);
    expect(serviceSource).toMatch(/Phoenix/);
  });

  it('wires learner and finance tool context into AI messages before OpenRouter', () => {
    const moduleSource = require('fs').readFileSync(require('path').join(__dirname, 'ai.module.ts'), 'utf8');
    const serviceSource = require('fs').readFileSync(require('path').join(__dirname, 'ai.service.ts'), 'utf8');
    const toolSource = require('fs').readFileSync(require('path').join(__dirname, 'ai-tool-context.service.ts'), 'utf8');

    expect(moduleSource).toMatch(/AiToolContextService/);
    expect(serviceSource).toMatch(/toolContext\?\.resolve/);
    expect(serviceSource).toMatch(/AI TOOL RESULT/);
    expect(toolSource).toMatch(/learner_record/);
    expect(toolSource).toMatch(/billing_assessment/);
    expect(toolSource).toMatch(/student_masterlist/);
    expect(toolSource).toMatch(/LEARNER_RECORD_ROLES/);
    expect(toolSource).toMatch(/BILLING_ASSESSMENT_ROLES/);
    expect(toolSource).toMatch(/studentAssessment/);
  });
});

