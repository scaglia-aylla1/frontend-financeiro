import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { RegisterComponent } from './features/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';



export const routes: Routes = [
   {path: 'login', component:LoginComponent},
   {path: 'register', component:RegisterComponent},
   {
    path: 'dashboard',
    component:Dashboard, canActivate:[authGuard]
   },
   {path: '', redirectTo: 'login', pathMatch: 'full'}   
];
