import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HasRoleDirective } from '../../shared/directives/has-role-directive';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatDividerModule, MatTooltipModule, HasRoleDirective],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  protected readonly auth = inject(AuthService);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard' },
    { label: 'Servicios', icon: 'event', route: '/services' },
    { label: 'Turnos', icon: 'event', route: '/appointments' },
    { label: 'Disponibilidad', icon: 'people', route: '/patients' },      
    //{ label: 'Usuarios', icon: 'person', route: '/users', adminOnly: true },
    //{ label: 'Admin Panel', icon: 'admin_panel_settings', route: '/admin', adminOnly: true },
  ];
}
