import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  type: ToastType;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal<ToastMessage | null>(null);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  show(type: ToastType, text: string, durationMs = 3000): void {
    this.clearTimer();
    this.message.set({ type, text });
    this.timeoutId = setTimeout(() => this.dismiss(), durationMs);
  }

  success(text: string, durationMs = 3000): void {
    this.show('success', text, durationMs);
  }

  error(text: string, durationMs = 3500): void {
    this.show('error', text, durationMs);
  }

  info(text: string, durationMs = 3000): void {
    this.show('info', text, durationMs);
  }

  dismiss(): void {
    this.clearTimer();
    this.message.set(null);
  }

  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
