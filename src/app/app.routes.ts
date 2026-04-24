import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { RegisterComponent } from './features/register/register';
import { authGuard } from './core/guards/auth-guard';
import { DashboardComponent } from './features/dashboard/dashboard';



export const routes: Routes = [
   {path: 'login', component:LoginComponent},
   {path: 'register', component:RegisterComponent},
   {
    path: 'dashboard',
    component:DashboardComponent,
    canActivate: [authGuard]
   },
   {path: '', redirectTo: 'login', pathMatch: 'full'}   
];
