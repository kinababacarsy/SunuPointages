// src/app/services/websocket1.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService1 {
  private socket: WebSocket;

  constructor() {
    this.socket = new WebSocket('ws://localhost:8080');
  }

  public sendMessage(message: string) {
    this.socket.send(message);
  }

  public onMessage(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.onmessage = (event) => {
        observer.next(event.data);
      };
    });
  }
}
