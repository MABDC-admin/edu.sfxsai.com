import { Component, Input } from '@angular/core';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCard } from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass, NgIf, NgTemplateOutlet, RouterLink],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input({ required: true }) stat!: StatCard;
}
