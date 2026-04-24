import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { RegisterComponent } from './features/register/register';
import { authGuard } from './core/guards/auth-guard';
import { DashboardComponent } from './features/dashboard/dashboard';
import { CategoriasComponent } from './features/categorias/categorias';



export const routes: Routes = [
   {path: 'login', component:LoginComponent},
   {path: 'register', component:RegisterComponent},
   {
    path: 'dashboard',
    component:DashboardComponent,
    canActivate: [authGuard]
   },
   {
    path: 'categorias',
    component: CategoriasComponent,
    canActivate: [authGuard]
   },
   {path: '', redirectTo: 'login', pathMatch: 'full'}   
];
