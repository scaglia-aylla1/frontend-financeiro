import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  protected readonly message = this.toastService.message;

  protected readonly classes = computed(() => {
    const toast = this.message();
    if (!toast) return '';
    if (toast.type === 'success') return 'bg-green-600 text-white';
    if (toast.type === 'error') return 'bg-red-600 text-white';
    return 'bg-slate-800 text-white';
  });

  protected dismiss(): void {
    this.toastService.dismiss();
  }
}
