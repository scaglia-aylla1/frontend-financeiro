import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { RegisterComponent } from './features/register/register';


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {path: 'register', component: RegisterComponent},
    { path: 'dashboard', component: Dashboard }
    
];
