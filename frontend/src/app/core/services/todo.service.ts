import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateTodoPayload,
  PaginatedTodos,
  Todo,
  UpdateTodoPayload,
} from '../models/todo.model';
import { TodoQuery } from '../models/todo-query.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/todos`;

  list(query: TodoQuery = {}): Observable<PaginatedTodos> {
    let params = new HttpParams();
    (Object.keys(query) as (keyof TodoQuery)[]).forEach((key) => {
      const value = query[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<PaginatedTodos>(this.apiUrl, { params });
  }

  get(id: string): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateTodoPayload): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateTodoPayload): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/${id}`, payload);
  }

  remove(id: string): Observable<{ success: true }> {
    return this.http.delete<{ success: true }>(`${this.apiUrl}/${id}`);
  }
}
