import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Verifica se o token existe (ajuste o nome 'token' para o que usa no login)
  const token = localStorage.getItem('token');

  if (token) {
    return true; // Permite o acesso
  } else {
    // Redireciona para o login se não estiver autenticado
    router.navigate(['/login']);
    return false;
  }
};
