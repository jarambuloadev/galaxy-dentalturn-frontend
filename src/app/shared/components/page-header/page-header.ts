import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
}


//Tipos de paramertros
//Input -> parametros de entrada: Padre pasa parametros al hijo
//Ouput -> Parametros de salida: Hijo devuelve parametros al padre