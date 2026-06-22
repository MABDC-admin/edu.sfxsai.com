import { NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import katex from 'katex';
import mermaid from 'mermaid';
import MarkdownIt from 'markdown-it';
import { AuthService } from '../../../core/services/auth.service';
import { FloatingAiAssistantService, AiAssistantMessage, GeneratedAiImage } from '../../../core/services/floating-ai-assistant.service';

interface PhoenixBook {
  gradeId: string;
  slug: string;
  title: string;
  subject?: string;
  pageCount?: number;
}

interface PhoenixGrade {
  id: string;
  name?: string;
  books?: PhoenixBook[];
}

type PhoenixReaderMode = 'single' | 'flip';
type PhoenixTool = 'pointer' | 'pen' | 'line' | 'circle' | 'box' | 'move' | 'delete';
type ChatViewMode = 'single' | 'dual';

@Component({
  selector: 'app-floating-ai-assistant',
  standalone: true,
  imports: [FormsModule, NgClass, NgFor, NgIf],
  templateUrl: './floating-ai-assistant.component.html',
  styleUrl: './floating-ai-assistant.component.scss',
})
export class FloatingAiAssistantComponent implements AfterViewChecked {
  readonly assistant = inject(FloatingAiAssistantService);
  private readonly auth = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly markdown = this.createMarkdownRenderer();
  private readonly renderedMarkdownCache = new Map<string, { content: string; html: SafeHtml }>();
  private mermaidRenderId = 0;
  private readonly autoScrollThresholdPx = 96;
  private shouldFollowMessageStream = true;
  readonly allowedRoles = ['ADMIN', 'REGISTRAR', 'FINANCE', 'PRINCIPAL', 'TEACHER'];
  readonly resourceFrameUrls: Record<string, SafeResourceUrl> = {
    Quipper: this.sanitizer.bypassSecurityTrustResourceUrl(this.assistant.resourceUrls['Quipper']),
  };
  draftText = '';
  chatViewMode: ChatViewMode = 'single';
  phoenixGrades: PhoenixGrade[] = [];
  activePhoenixGradeId = '';
  selectedPhoenixBook: PhoenixBook | null = null;
  phoenixSearch = '';
  phoenixPage = 1;
  phoenixZoom = 100;
  phoenixReaderMode: PhoenixReaderMode = 'single';
  phoenixTool: PhoenixTool = 'pointer';
  phoenixAnnotationColor = '#facc15';
  phoenixAnnotationSize = 4;
  imagePrompt = '';
  imageAspectRatio = '1:1';
  imageSize = '1K';
  generatedImages: GeneratedAiImage[] = [];
  isImageGenerating = false;
  imageGenerationError = '';
  isHistoryOpen = true;
  isPhoenixLoading = false;
  phoenixError = '';
  private hasLoadedPhoenix = false;
  private lastToolActionKey = '';
  private lastToolActionAt = 0;

  @ViewChild('messageInput') private messageInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('messageList') private messageList?: ElementRef<HTMLDivElement>;

  constructor() {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'strict',
    });
  }

  canShow(): boolean {
    const role = this.auth.getUserRole();
    return !!role && this.allowedRoles.includes(role);
  }

  send(): void {
    const value = this.draftText.trim();
    if (!value) {
      return;
    }

    if (this.chatViewMode === 'dual') {
      void this.assistant.sendDualMessage(value);
    } else {
      void this.assistant.sendMessage(value);
    }
    this.draftText = '';
    if (this.messageInput?.nativeElement) {
      this.messageInput.nativeElement.value = '';
    }
    this.shouldFollowMessageStream = true;
    this.scrollMessageListToBottom(true);
  }

  ngAfterViewChecked(): void {
    if (this.assistant.isOpen() && this.assistant.activeWorkspaceTab() === 'AI Assistant') {
      void this.renderMermaidDiagrams();
      this.scrollMessageListToBottom();
    }
  }

  startNewChat(): void {
    this.assistant.startNewChat();
    this.draftText = '';
    this.shouldFollowMessageStream = true;
    window.setTimeout(() => this.scrollMessageListToBottom(true), 0);
  }

  toggleHistory(): void {
    this.isHistoryOpen = !this.isHistoryOpen;
  }

  setChatViewMode(mode: ChatViewMode): void {
    if (this.assistant.isLoading()) {
      return;
    }
    this.chatViewMode = mode;
  }

  renameChat(sessionId: string, currentTitle: string): void {
    const title = window.prompt('Rename this chat', currentTitle);
    if (title !== null) {
      this.assistant.renameSession(sessionId, title);
    }
  }

  deleteChat(sessionId: string): void {
    if (window.confirm('Delete this chat history?')) {
      this.assistant.deleteSession(sessionId);
    }
  }

  setWorkspaceTab(tab: string): void {
    this.assistant.setWorkspaceTab(tab);
    if (tab === 'Phoenix' && !this.hasLoadedPhoenix) {
      void this.loadPhoenixBooks();
    }
  }

  async generateImage(): Promise<void> {
    const prompt = this.imagePrompt.trim();
    if (!prompt || this.isImageGenerating) {
      return;
    }

    this.isImageGenerating = true;
    this.imageGenerationError = '';
    try {
      const result = await this.assistant.generateImage(prompt, {
        aspectRatio: this.imageAspectRatio,
        imageSize: this.imageSize,
      });
      this.generatedImages = [...result.images, ...this.generatedImages].slice(0, 12);
    } catch {
      this.imageGenerationError = 'Image generation is temporarily unavailable. Please try again.';
    } finally {
      this.isImageGenerating = false;
    }
  }

  openGeneratedImage(image: GeneratedAiImage): void {
    window.open(image.url, '_blank');
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  onMessageListScroll(): void {
    const container = this.messageList?.nativeElement;
    if (!container) {
      return;
    }
    this.shouldFollowMessageStream = this.isMessageListNearBottom(container);
  }

  onMessageListWheel(event: WheelEvent): void {
    const container = this.messageList?.nativeElement;
    if (!container) {
      return;
    }
    const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
    if (maxScrollTop > 0) {
      const nextScrollTop = Math.min(maxScrollTop, Math.max(0, container.scrollTop + event.deltaY));
      container.scrollTop = nextScrollTop;
      this.shouldFollowMessageStream = this.isMessageListNearBottom(container);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  copyResponse(message: AiAssistantMessage): void {
    void this.copyText(message.content);
  }

  copyResponseMarkdown(message: AiAssistantMessage): void {
    void this.copyText(message.content);
  }

  sendFollowUp(prompt: string): void {
    const trimmed = prompt.trim();
    if (!trimmed || !this.assistant.canSend()) {
      return;
    }
    void this.assistant.sendMessage(trimmed);
    this.shouldFollowMessageStream = true;
    window.setTimeout(() => this.scrollMessageListToBottom(true), 0);
  }

  private async copyText(value: string): Promise<void> {
    const text = value.trim();
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.assistant.isOpen()) {
      this.assistant.close();
    }
  }

  trackMessage(_: number, message: AiAssistantMessage): string {
    return message.id;
  }

  renderMarkdown(message: AiAssistantMessage): SafeHtml {
    return this.getCachedRenderedMarkdown(message.id, message.content);
  }

  private getCachedRenderedMarkdown(messageId: string, content: string): SafeHtml {
    const cached = this.renderedMarkdownCache.get(messageId);
    if (cached?.content === content) {
      return cached.html;
    }

    const html = this.markdown.render(this.prepareRichMarkdown(content));
    const safeHtml = DOMPurify.sanitize(html, {
      ADD_TAGS: ['button'],
      ADD_ATTR: ['target', 'rel', 'class', 'type', 'role', 'tabindex', 'data-mermaid-source', 'data-rendered', 'data-ai-tool', 'data-student-id', 'data-student-name', 'data-ai-prompt'],
    });
    const rendered = this.sanitizer.bypassSecurityTrustHtml(safeHtml);
    this.renderedMarkdownCache.set(messageId, { content, html: rendered });
    if (this.renderedMarkdownCache.size > 120) {
      const firstKey = this.renderedMarkdownCache.keys().next().value;
      if (firstKey) {
        this.renderedMarkdownCache.delete(firstKey);
      }
    }
    return rendered;
  }

  handleMarkdownAction(event: MouseEvent): void {
    const rawTarget = event.target as Node | null;
    const target = rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement;
    const promptAction = target?.closest('[data-ai-prompt]') as HTMLElement | null;
    if (promptAction) {
      if (this.hasActiveTextSelection()) {
        return;
      }
      const prompt = promptAction.getAttribute('data-ai-prompt') || '';
      this.executePromptAction(event, prompt);
      return;
    }

    const action = target?.closest('[data-ai-tool][data-student-id]') as HTMLElement | null;
    if (!action) {
      return;
    }

    if (this.hasActiveTextSelection()) {
      return;
    }

    const tool = action.getAttribute('data-ai-tool') || '';
    const studentId = action.getAttribute('data-student-id') || '';
    const studentName = action.getAttribute('data-student-name') || 'selected learner';
    if (!studentId || !tool) {
      return;
    }

    this.executeLearnerToolAction(event, tool, studentId, studentName);
  }

  private hasActiveTextSelection(): boolean {
    return Boolean(window.getSelection?.()?.toString().trim());
  }
  private executePromptAction(event: MouseEvent, prompt: string): void {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return;
    }
    const actionKey = `prompt:${trimmed}`;
    if (this.isDuplicateToolAction(actionKey)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    void this.assistant.sendMessage(trimmed);
    this.shouldFollowMessageStream = true;
    window.setTimeout(() => this.scrollMessageListToBottom(true), 0);
  }

  private executeLearnerToolAction(event: MouseEvent, tool: string, studentId: string, studentName: string): void {
    const actionKey = `${tool}:${studentId}`;
    if (this.isDuplicateToolAction(actionKey)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    void this.assistant.sendToolCommand(tool, studentId, studentName);
    this.shouldFollowMessageStream = true;
    window.setTimeout(() => this.scrollMessageListToBottom(true), 0);
  }

  private isDuplicateToolAction(actionKey: string): boolean {
    const now = Date.now();
    if (this.lastToolActionKey === actionKey && now - this.lastToolActionAt < 500) {
      return true;
    }
    this.lastToolActionKey = actionKey;
    this.lastToolActionAt = now;
    return false;
  }

  private scrollMessageListToBottom(force = false): void {
    const container = this.messageList?.nativeElement;
    if (!container) {
      return;
    }
    if (!force && !this.shouldFollowMessageStream) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }

  private isMessageListNearBottom(container: HTMLDivElement): boolean {
    return container.scrollHeight - container.scrollTop - container.clientHeight <= this.autoScrollThresholdPx;
  }

  private createMarkdownRenderer(): MarkdownIt {
    const markdown = new MarkdownIt({
      breaks: true,
      html: true,
      linkify: true,
      typographer: true,
      highlight: (code, language) => {
        if (language?.toLowerCase() === 'mermaid') {
          return this.renderMermaidPlaceholder(code);
        }
        return `<pre><code>${this.escapeHtml(code)}</code></pre>`;
      },
    });

    const defaultLinkOpen = markdown.renderer.rules['link_open'];
    markdown.renderer.rules['link_open'] = (tokens, index, options, env, self) => {
      const token = tokens[index];
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noopener noreferrer');
      return defaultLinkOpen ? defaultLinkOpen(tokens, index, options, env, self) : self.renderToken(tokens, index, options);
    };

    const defaultTableOpen = markdown.renderer.rules['table_open'];
    markdown.renderer.rules['table_open'] = (tokens, index, options, env, self) => {
      tokens[index].attrJoin('class', 'ai-markdown-table');
      return defaultTableOpen ? defaultTableOpen(tokens, index, options, env, self) : self.renderToken(tokens, index, options);
    };

    const defaultImage = markdown.renderer.rules['image'];
    markdown.renderer.rules['image'] = (tokens, index, options, env, self) => {
      const token = tokens[index];
      const src = token.attrGet('src') || '';
      const alt = token.content || token.attrGet('alt') || 'Reference image';
      if (/^https?:\/\//.test(src)) {
        return this.renderImageCard(alt, src);
      }
      return defaultImage ? defaultImage(tokens, index, options, env, self) : self.renderToken(tokens, index, options);
    };

    return markdown;
  }

  private prepareRichMarkdown(content: string): string {
    const withMath = this.renderMathExpressions(content);
    return withMath
      .split(/\r?\n/)
      .map(line => this.transformRichMarkdownLine(line))
      .join('\n');
  }

  private transformRichMarkdownLine(line: string): string {
    const trimmed = line.trim();
    if (!trimmed) {
      return line;
    }

    const youtubeUrl = this.extractYoutubeUrl(trimmed);
    if (youtubeUrl && trimmed === youtubeUrl) {
      return this.renderYoutubePreview(youtubeUrl);
    }

    const visualPlaceholder = this.renderVisualPlaceholder(trimmed);
    if (visualPlaceholder) {
      return visualPlaceholder;
    }

    const callout = this.renderCallout(trimmed);
    if (callout) {
      return callout;
    }

    const suggestionAction = this.renderSuggestionAction(trimmed);
    if (suggestionAction) {
      return suggestionAction;
    }

    return line;
  }

  private renderSuggestionAction(line: string): string {
    const match = line.match(/^(?:[-*]\s*)?(?<icon>\u{1F4C4}|\u{1F4CB}|\u{1F50D}|\u{1F50E}|\u{1F4DD}|\u{2705})\s+(?<label>[^?]{8,180}\?)$/u);
    const label = match?.groups?.['label']?.trim();
    const icon = match?.groups?.['icon'] || '';
    if (!label) {
      return '';
    }
    const prompt = label.replace(/\?$/, '').replace(/[*_]/g, '').trim();
    return `<span role="button" tabindex="0" class="ai-suggestion-action" data-ai-prompt="${this.escapeAttribute(prompt)}"><span class="ai-suggestion-icon">${this.escapeHtml(icon)}</span><span>${this.renderInline(label)}</span></span>`;
  }

  private renderMathExpressions(content: string): string {
    return content
      .replace(/\$\$([\s\S]+?)\$\$/g, (_match, expression) => this.renderKatex(expression, true))
      .replace(/\\\[([\s\S]+?)\\\]/g, (_match, expression) => this.renderKatex(expression, true))
      .replace(/\\\(([\s\S]+?)\\\)/g, (_match, expression) => this.renderKatex(expression, false))
      .replace(/\$([^$\n]+)\$/g, (_match, expression) => this.renderKatex(expression, false));
  }

  private renderKatex(expression: string, displayMode: boolean): string {
    try {
      return katex.renderToString(expression.trim(), {
        displayMode,
        throwOnError: false,
        strict: 'ignore',
        trust: false,
      });
    } catch {
      return displayMode
        ? `<div class="ai-math-block">${this.escapeHtml(expression)}</div>`
        : `<span class="ai-math-inline">${this.escapeHtml(expression)}</span>`;
    }
  }

  private renderMermaidPlaceholder(code: string): string {
    return `<div class="ai-mermaid-diagram" data-mermaid-source="${this.escapeAttribute(encodeURIComponent(code))}"><pre>${this.escapeHtml(code)}</pre></div>`;
  }

  private async renderMermaidDiagrams(): Promise<void> {
    const container = this.messageList?.nativeElement;
    if (!container) {
      return;
    }

    const diagrams = Array.from(container.querySelectorAll<HTMLElement>('.ai-mermaid-diagram:not([data-rendered])'));
    for (const diagram of diagrams) {
      const source = decodeURIComponent(diagram.dataset['mermaidSource'] || '');
      if (!source.trim()) {
        continue;
      }

      diagram.dataset['rendered'] = 'true';
      try {
        const id = `ai-mermaid-${Date.now()}-${this.mermaidRenderId++}`;
        const result = await mermaid.render(id, source);
        diagram.innerHTML = DOMPurify.sanitize(result.svg, { USE_PROFILES: { svg: true, svgFilters: true } });
      } catch {
        diagram.classList.add('error');
        diagram.innerHTML = `<strong>Diagram could not render</strong><pre>${this.escapeHtml(source)}</pre>`;
      }
    }
  }

  async loadPhoenixBooks(): Promise<void> {
    this.isPhoenixLoading = true;
    this.phoenixError = '';
    this.hasLoadedPhoenix = true;

    try {
      const response = await fetch(`${this.assistant.phoenixApiBaseUrl}/api/phoenix/books`);
      if (!response.ok) {
        throw new Error(`Phoenix API returned ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data?.grades)) {
        throw new Error('Phoenix API returned no grades');
      }

      this.phoenixGrades = data.grades;
      const firstGrade = this.phoenixGrades[0];
      this.activePhoenixGradeId = this.activePhoenixGradeId || firstGrade?.id || '';
    } catch {
      this.phoenixGrades = [];
      this.activePhoenixGradeId = '';
      this.selectedPhoenixBook = null;
      this.phoenixError = 'Phoenix books API is not available from the VPS right now. The panel is ready, but the server must expose /api/phoenix/books on port 3018.';
    } finally {
      this.isPhoenixLoading = false;
    }
  }

  activePhoenixGrade(): PhoenixGrade | null {
    return this.phoenixGrades.find(grade => grade.id === this.activePhoenixGradeId) || this.phoenixGrades[0] || null;
  }

  filteredPhoenixBooks(): PhoenixBook[] {
    const books = this.activePhoenixGrade()?.books || [];
    const query = this.phoenixSearch.trim().toLowerCase();
    if (!query) {
      return books;
    }
    return books.filter(book => `${book.title} ${book.subject || ''} ${book.slug}`.toLowerCase().includes(query));
  }

  selectPhoenixGrade(gradeId: string): void {
    this.activePhoenixGradeId = gradeId;
    this.selectedPhoenixBook = null;
    this.phoenixPage = 1;
  }

  selectPhoenixBook(book: PhoenixBook): void {
    this.selectedPhoenixBook = book;
    this.phoenixPage = 1;
  }

  setPhoenixPage(page: number): void {
    const total = this.selectedPhoenixBook?.pageCount || 1;
    this.phoenixPage = Math.min(Math.max(page, 1), total);
  }

  setPhoenixZoom(value: number): void {
    this.phoenixZoom = Math.min(Math.max(value, 60), 180);
  }

  setPhoenixReaderMode(mode: PhoenixReaderMode): void {
    this.phoenixReaderMode = mode;
  }

  setPhoenixTool(tool: PhoenixTool): void {
    this.phoenixTool = tool;
  }

  phoenixVisiblePages(): number[] {
    if (!this.selectedPhoenixBook) {
      return [];
    }
    const total = this.selectedPhoenixBook.pageCount || 1;
    if (this.phoenixReaderMode === 'single') {
      return [this.phoenixPage];
    }
    return [this.phoenixPage, Math.min(this.phoenixPage + 1, total)].filter((page, index, pages) => pages.indexOf(page) === index);
  }

  phoenixPageTransform(): string {
    return `scale(${this.phoenixZoom / 100})`;
  }

  getPhoenixPageUrl(book: PhoenixBook, page = this.phoenixPage): string {
    return `${this.assistant.phoenixApiBaseUrl}/api/phoenix/book/${encodeURIComponent(book.gradeId)}/${encodeURIComponent(book.slug)}/page/${encodeURIComponent(page)}`;
  }

  getPhoenixThumbnailUrl(book: PhoenixBook, page = 1): string {
    return `${this.assistant.phoenixApiBaseUrl}/api/phoenix/book/${encodeURIComponent(book.gradeId)}/${encodeURIComponent(book.slug)}/thumbnail/${encodeURIComponent(page)}.webp`;
  }

  private markdownToHtml(content: string): string {
    const blocks = this.extractCodeBlocks(content);
    const lines = blocks.text.split(/\r?\n/);
    const html: string[] = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      const trimmed = line.trim();

      if (!trimmed) {
        index += 1;
        continue;
      }

      const codeMatch = trimmed.match(/^@@CODE_BLOCK_(\d+)@@$/);
      if (codeMatch) {
        const code = blocks.codeBlocks[Number(codeMatch[1])] || '';
        html.push(`<pre><code>${this.escapeHtml(code)}</code></pre>`);
        index += 1;
        continue;
      }

      if (trimmed.startsWith('$$') || trimmed.startsWith('\\[')) {
        const mathLines: string[] = [];
        const closing = trimmed.startsWith('$$') ? '$$' : '\\]';
        while (index < lines.length) {
          mathLines.push(lines[index]);
          if (lines[index].trim().endsWith(closing) && mathLines.length > 1) {
            break;
          }
          if (mathLines.length === 1 && trimmed.endsWith(closing) && trimmed.length > closing.length * 2) {
            break;
          }
          index += 1;
        }
        if (mathLines.length > 1 || trimmed.endsWith(closing)) {
          html.push(this.renderMathBlock(mathLines.join('\n')));
          index += 1;
          continue;
        }
      }

      const imageMatch = trimmed.match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
      if (imageMatch) {
        html.push(this.renderImageCard(imageMatch[1], imageMatch[2]));
        index += 1;
        continue;
      }

      const youtubeUrl = this.extractYoutubeUrl(trimmed);
      if (youtubeUrl) {
        html.push(this.renderYoutubePreview(youtubeUrl));
        index += 1;
        continue;
      }

      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        while (index < lines.length && lines[index].trim().startsWith('>')) {
          quoteLines.push(lines[index].trim().replace(/^>\s?/, ''));
          index += 1;
        }
        html.push(this.renderCalloutFromBlockquote(quoteLines));
        continue;
      }

      const visualPlaceholder = this.renderVisualPlaceholder(trimmed);
      if (visualPlaceholder) {
        html.push(visualPlaceholder);
        index += 1;
        continue;
      }

      const callout = this.renderCallout(trimmed);
      if (callout) {
        html.push(callout);
        index += 1;
        continue;
      }

      if (this.isTableStart(lines, index)) {
        const tableLines: string[] = [];
        while (index < lines.length && this.isPipeTableRow(lines[index])) {
          tableLines.push(lines[index]);
          index += 1;
        }
        html.push(this.renderMarkdownTable(tableLines));
        continue;
      }

      const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        html.push(`<h${level}>${this.renderInline(heading[2])}</h${level}>`);
        index += 1;
        continue;
      }

      if (this.isChecklistItem(trimmed)) {
        const items: string[] = [];
        while (index < lines.length && this.isChecklistItem(lines[index].trim())) {
          const item = lines[index].trim().match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
          if (item) {
            const checked = item[1].toLowerCase() === 'x';
            items.push(`<li class="${checked ? 'checked' : ''}"><span>${checked ? '✓' : ''}</span>${this.renderInline(item[2])}</li>`);
          }
          index += 1;
        }
        html.push(`<ul class="ai-checklist">${items.join('')}</ul>`);
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        const items: string[] = [];
        while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
          items.push(`<li>${this.renderInline(lines[index].trim().replace(/^[-*]\s+/, ''))}</li>`);
          index += 1;
        }
        html.push(`<ul>${items.join('')}</ul>`);
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const items: string[] = [];
        while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
          items.push(`<li>${this.renderInline(lines[index].trim().replace(/^\d+\.\s+/, ''))}</li>`);
          index += 1;
        }
        html.push(`<ol>${items.join('')}</ol>`);
        continue;
      }

      html.push(`<p>${this.renderInline(trimmed)}</p>`);
      index += 1;
    }

    return html.join('');
  }

  private extractCodeBlocks(content: string): { text: string; codeBlocks: string[] } {
    const codeBlocks: string[] = [];
    const text = content.replace(/```[\w-]*\n?([\s\S]*?)```/g, (_match, code) => {
      const marker = `@@CODE_BLOCK_${codeBlocks.length}@@`;
      codeBlocks.push(`${code}`.replace(/\n$/, ''));
      return marker;
    });
    return { text, codeBlocks };
  }

  private isTableStart(lines: string[], index: number): boolean {
    return this.isPipeTableRow(lines[index]) && (this.isTableSeparator(lines[index + 1]) || this.isPipeTableRow(lines[index + 1]));
  }

  private isPipeTableRow(line = ''): boolean {
    if (this.isTableSeparator(line)) {
      return true;
    }
    const trimmed = line.trim();
    return trimmed.includes('|') && this.parseTableCells(trimmed).length >= 2;
  }

  private isTableSeparator(line = ''): boolean {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
  }

  private renderMarkdownTable(lines: string[]): string {
    const rows = lines.filter(line => !this.isTableSeparator(line)).map(line => this.parseTableCells(line));
    const [header = [], ...body] = rows;
    const headerHtml = header.map(cell => `<th>${this.renderInline(cell)}</th>`).join('');
    const bodyHtml = body.map(row => `<tr>${row.map(cell => `<td>${this.renderInline(cell)}</td>`).join('')}</tr>`).join('');
    return `<table class="ai-markdown-table"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
  }

  private parseTableCells(line: string): string[] {
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());
  }

  private isChecklistItem(line: string): boolean {
    return /^[-*]\s+\[[ xX]\]\s+/.test(line);
  }

  private renderCallout(line: string): string {
    const match = line.match(/^(tip|note|info|warning|caution|example|activity|assessment|question|remember)\s*:\s*(.+)$/i);
    if (!match) {
      return '';
    }

    const type = match[1].toLowerCase();
    const label = this.calloutLabel(type);
    return `<aside class="ai-callout ${this.calloutClass(type)}"><strong>${label}</strong><p>${this.renderInline(match[2])}</p></aside>`;
  }

  private renderCalloutFromBlockquote(lines: string[]): string {
    const [first = '', ...rest] = lines;
    const typed = first.match(/^\[!(TIP|NOTE|INFO|WARNING|CAUTION|EXAMPLE|ACTIVITY|ASSESSMENT|QUESTION|REMEMBER)\]\s*(.*)$/i);
    if (!typed) {
      const body = lines.map(line => this.renderInline(line)).join('<br>');
      return `<blockquote>${body}</blockquote>`;
    }

    const type = typed[1].toLowerCase();
    const title = typed[2] || this.calloutLabel(type);
    const body = rest.length ? rest.map(line => this.renderInline(line)).join('<br>') : '';
    return `<aside class="ai-callout ${this.calloutClass(type)}"><strong>${this.renderInline(title)}</strong>${body ? `<p>${body}</p>` : ''}</aside>`;
  }

  private renderVisualPlaceholder(line: string): string {
    const match = line.match(/^(illustration|visual|diagram|board work|placeholder|flowchart|concept map)\s*:\s*(.+)$/i);
    if (!match) {
      return '';
    }

    const label = match[1].replace(/\b\w/g, character => character.toUpperCase());
    return `<figure class="ai-visual-placeholder"><div class="ai-visual-grid"><span></span><span></span><span></span><span></span></div><figcaption><strong>${this.escapeHtml(label)}</strong><p>${this.renderInline(match[2])}</p></figcaption></figure>`;
  }

  private renderMathBlock(value: string): string {
    return `<div class="ai-math-block">${this.escapeHtml(this.cleanMathDelimiters(value))}</div>`;
  }

  private renderImageCard(alt: string, url: string): string {
    const safeUrl = this.escapeAttribute(url);
    return `<figure class="ai-image-card"><img src="${safeUrl}" alt="${this.escapeAttribute(alt || 'AI response image')}" loading="lazy"><figcaption>${this.renderInline(alt || 'Reference image')}</figcaption></figure>`;
  }

  private extractYoutubeUrl(value: string): string {
    const match = value.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})[^\s)]*/);
    return match?.[0] || '';
  }

  private renderYoutubePreview(url: string): string {
    const videoId = this.extractYoutubeVideoId(url);
    if (!videoId) {
      return `<p>${this.renderInline(url)}</p>`;
    }

    const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    return `<a class="ai-youtube-preview" href="${this.escapeAttribute(watchUrl)}" target="_blank" rel="noopener noreferrer"><img src="${this.escapeAttribute(thumbnail)}" alt="YouTube video preview" loading="lazy"><span><strong>YouTube Preview</strong><em>Open classroom video resource</em></span><b class="material-icons">play_circle</b></a>`;
  }

  private extractYoutubeVideoId(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/);
    return match?.[1] || '';
  }

  private calloutLabel(type: string): string {
    const labels: Record<string, string> = {
      tip: 'Tip',
      note: 'Note',
      info: 'Info',
      warning: 'Warning',
      caution: 'Caution',
      example: 'Example',
      activity: 'Activity',
      assessment: 'Assessment',
      question: 'Question',
      remember: 'Remember',
    };
    return labels[type] || 'Note';
  }

  private calloutClass(type: string): string {
    return ['warning', 'caution'].includes(type) ? 'warning' : ['activity', 'assessment', 'example'].includes(type) ? 'teaching' : 'info';
  }

  private renderInline(value: string): string {
    const protectedMath = this.protectMathSegments(value);
    const html = this.escapeHtml(protectedMath.text)
      .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<span class="ai-inline-image">$1</span>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/(https?:\/\/[^\s<]+)(?![^<]*>)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    return this.restoreMathSegments(html, protectedMath.mathSegments);
  }

  private protectMathSegments(value: string): { text: string; mathSegments: string[] } {
    const mathSegments: string[] = [];
    const text = value.replace(/(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+\$)/g, (match) => {
      const marker = `@@MATH_${mathSegments.length}@@`;
      mathSegments.push(this.cleanMathDelimiters(match));
      return marker;
    });
    return { text, mathSegments };
  }

  private restoreMathSegments(value: string, mathSegments: string[]): string {
    return value.replace(/@@MATH_(\d+)@@/g, (_match, index) => {
      const math = mathSegments[Number(index)] || '';
      return `<span class="ai-math-inline">${this.escapeHtml(math)}</span>`;
    });
  }

  private cleanMathDelimiters(value: string): string {
    return value
      .trim()
      .replace(/^\$\$|\$\$$/g, '')
      .replace(/^\\\[|\\\]$/g, '')
      .replace(/^\\\(|\\\)$/g, '')
      .replace(/^\$|\$$/g, '')
      .trim();
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeAttribute(value: string): string {
    return this.escapeHtml(value).replace(/`/g, '&#96;');
  }
}

