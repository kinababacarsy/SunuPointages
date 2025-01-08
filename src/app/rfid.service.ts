// rfid.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfidService {
  private socket: WebSocket;

  constructor() {
    this.socket = new WebSocket('ws://localhost:8080');
  }

  public listen(): Observable<any> {
    return new Observable(observer => {
      this.socket.onmessage = (event) => {
        observer.next(JSON.parse(event.data));
      };
      this.socket.onerror = (error) => {
        observer.error(error);
      };
      this.socket.onclose = () => {
        observer.complete();
      };
    });
  }
}
