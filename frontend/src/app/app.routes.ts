import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MentorListComponent } from './pages/mentors/mentor-list.component';
import { MentorDetailComponent } from './pages/mentor-detail/mentor-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Force Mentor - Accueil' },
  { path: 'connexion', component: LoginComponent, title: 'Connexion - Force Mentor' },
  { path: 'inscription', component: RegisterComponent, title: 'Inscription - Force Mentor' },
  { path: 'mentors', component: MentorListComponent, title: 'Annuaire des Mentors - Force Mentor' },
  { path: 'mentor/:id', component: MentorDetailComponent, title: 'Profil Mentor - Force Mentor' },
  { path: 'tableau-de-bord', component: DashboardComponent, title: 'Tableau de bord - Force Mentor' },
  { path: 'profil', component: ProfileComponent, title: 'Mon Profil - Force Mentor' },
  { path: '**', redirectTo: '' }
];
