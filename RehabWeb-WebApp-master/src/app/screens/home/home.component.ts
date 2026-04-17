import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Vista presentacional: solo navegación hacia Biblioteca y Nueva rutina.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
