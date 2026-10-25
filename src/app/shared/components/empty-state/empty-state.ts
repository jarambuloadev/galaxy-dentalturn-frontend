import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Sin resultados';
  @Input() message = 'No hay elementos para mostrar.';
  @Input() actionLabel?: string;
}
