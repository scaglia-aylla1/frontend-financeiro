import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Importante para o HTML reconhecer o form
  templateUrl: './login.html',
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
  ) {
    // Definindo o formulário e as validações
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Valida se é um e-mail real
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        if (res.data?.accessToken && res.data?.refreshToken) {
          this.authService.persistSession(res.data);
          this.router.navigate(['/dashboard']);
        } else {
          console.error('Tokens não encontrados na resposta do servidor', res);
        }
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.toastService.error('Erro ao realizar login. Verifique suas credenciais.');
      },
    });
  }
}
