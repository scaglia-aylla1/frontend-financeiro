import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Importante para o HTML reconhecer o form
  templateUrl: './login.html'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Definindo o formulário e as validações
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Valida se é um e-mail real
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          console.log('Sucesso!', res);
          this.router.navigate(['/dashboard']); // Redireciona após o sucesso
        },
        error: (err) => {
          console.error('Erro detalhado:', err);
          alert('Credenciais inválidas ou erro no servidor');
        }
      });
    }
  }
}