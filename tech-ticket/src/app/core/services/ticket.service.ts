import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Ticket {
  id: number;
  title: string;
  completed: boolean;
}

interface TicketState {
  data: Ticket[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  // DIP: inyección de dependencias moderna
  private http = inject(HttpClient);

  // OCP y encapsulación: el estado es privado y solo se muta desde aquí
  private state = signal<TicketState>({
    data: [],
    loading: false,
    error: null,
  });

  // Exposición controlada (solo lectura / derivaciones reactivas)
  public tickets = computed(() => this.state().data);
  public isLoading = computed(() => this.state().loading);
  public errorMessage = computed(() => this.state().error);

  public fetchTickets(): void {
    // Mutación inicial: activamos el indicador de carga
    this.state.update(s => ({ ...s, loading: true, error: null }));

    this.http
      .get<Ticket[]>('https://jsonplaceholder.typicode.com/todos?_limit=15')
      .subscribe({
        next: (response) => {
          this.state.update(s => ({ ...s, data: response, loading: false }));
        },
        error: () => {
          this.state.update(s => ({
            ...s,
            error: 'Error de red al contactar con el servidor. Revise su conexión.',
            loading: false,
          }));
        },
      });
  }
}
