import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { TicketService } from '../../core/services/ticket.service';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton,
  IonLabel, IonSpinner, IonText, IonButton, IonList, IonItem, IonBadge,
} from '@ionic/angular';

type Filtro = 'todos' | 'abiertos' | 'cerrados';

@Component({
  selector: 'app-ticket-dashboard',
  standalone: true,
  // Ocupa toda la página: sin esto, ion-content se colapsa dentro del host
  host: { class: 'ion-page' },
  changeDetection: ChangeDetectionStrategy.OnPush, // Optimización de renderizado
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton,
    IonLabel, IonSpinner, IonText, IonButton, IonList, IonItem, IonBadge,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="dark">
        <ion-title>TechTicket FP</ion-title>
        <ion-badge slot="end" color="tertiary" class="ion-margin-end">
          {{ ticketsFiltrados().length }} tickets
        </ion-badge>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- UI: selector de filtro -->
      <ion-segment (ionChange)="cambiarFiltro($event)" value="todos" class="ion-margin-bottom">
        <ion-segment-button value="todos"><ion-label>Todos</ion-label></ion-segment-button>
        <ion-segment-button value="abiertos"><ion-label>Abiertos</ion-label></ion-segment-button>
        <ion-segment-button value="cerrados"><ion-label>Cerrados</ion-label></ion-segment-button>
      </ion-segment>

      <!-- Control Flow: gestión de estado asíncrono (feedback UI) -->
      @if (ticketService.isLoading()) {
        <div class="ion-text-center ion-margin-top">
          <ion-spinner name="dots"></ion-spinner>
          <p>Sincronizando incidencias...</p>
        </div>
      } @else if (ticketService.errorMessage()) {
        <div class="ion-text-center">
          <ion-text color="danger">
            <p>{{ ticketService.errorMessage() }}</p>
          </ion-text>
          <ion-button (click)="ticketService.fetchTickets()">Reintentar</ion-button>
        </div>
      } @else {
        <ion-list>
          @for (t of ticketsFiltrados(); track t.id) {
            <ion-item>
              <ion-label class="ion-text-wrap">
                <h2>#{{ t.id }} · {{ t.title }}</h2>
              </ion-label>
              <ion-badge slot="end" [color]="t.completed ? 'success' : 'warning'">
                {{ t.completed ? 'Cerrado' : 'Abierto' }}
              </ion-badge>
            </ion-item>
          } @empty {
            <ion-item>
              <ion-label class="ion-text-center">No hay tickets para este filtro</ion-label>
            </ion-item>
          }
        </ion-list>
      }
    </ion-content>
  `,
})
export class TicketDashboardComponent implements OnInit {
  // DIP: Angular nos provee el servicio
  public ticketService = inject(TicketService);

  // Señal local: estado de la vista (filtro activo)
  public filtro = signal<Filtro>('todos');

  // Derivada: combina el estado global (servicio) con el estado local (filtro)
  public ticketsFiltrados = computed(() => {
    const tickets = this.ticketService.tickets();
    switch (this.filtro()) {
      case 'abiertos': return tickets.filter(t => !t.completed);
      case 'cerrados': return tickets.filter(t => t.completed);
      default: return tickets;
    }
  });

  ngOnInit(): void {
    this.ticketService.fetchTickets();
  }

  public cambiarFiltro(event: CustomEvent): void {
    this.filtro.set(event.detail.value as Filtro);
  }
}
