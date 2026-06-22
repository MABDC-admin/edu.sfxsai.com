import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { FloatingChatComponent } from '../../shared/components/floating-chat/floating-chat.component';
import { FloatingAiAssistantComponent } from '../../shared/components/floating-ai-assistant/floating-ai-assistant.component';
import { AutoLogoutService } from '../../core/services/auto-logout.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, FloatingChatComponent, FloatingAiAssistantComponent],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {
  constructor() {
    inject(AutoLogoutService).start();
  }
}
