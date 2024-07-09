import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: any;
  private readonly SERVER_URL = 'http://139.59.21.236:3001'; // Adjust the URL as needed
  private unreadMessagesSubject = new Subject<{ sender: string; content: string; recipient: string; timestamp: string }[]>();

  constructor() {
    this.socket = io(this.SERVER_URL, {
      transports: ['websocket', 'polling']
    });
  }

  public identifyUser(userId: string): void {
    this.socket.emit('identify', userId);
  }

  public sendMessage(message: { sender: string; content: string; recipient: string }): void {
    this.socket.emit('message', message);
  }

  public getMessages(): Observable<{ sender: string; content: string; recipient: string }> {
    return new Observable<{ sender: string; content: string; recipient: string }>((observer) => {
      this.socket.on('message', (data: { sender: string; content: string; recipient: string }) => {
        observer.next(data);
      });
    });
  }

  public getUnreadMessages(): Observable<{ sender: string; content: string; recipient: string; timestamp: string }[]> {
    return this.unreadMessagesSubject.asObservable();
  }

  public initializeUnreadMessagesListener(): void {
    this.socket.on('unreadMessages', (messages: { sender: string; content: string; recipient: string; timestamp: string }[]) => {
      this.unreadMessagesSubject.next(messages);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}