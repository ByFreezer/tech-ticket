import { Component } from '@angular/core';
import { TicketDashboardComponent } from '../features/ticket-dashboard/ticket-dashboard.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  standalone: true,
  imports: [TicketDashboardComponent],
})
export class HomePage {}
