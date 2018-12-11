
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ProjectsComponent } from './projects/projects.component';
import { AuthGuard } from './guards/auth.guard';
import { ProjectDetailComponent } from './projects/project-detail.component';
import { SponsorsComponent } from './sponsors/sponsors.component';

const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },
    { path: 'projects/:id', canActivate: [AuthGuard], component: ProjectDetailComponent},
    { path: 'sponsors', canActivate: [AuthGuard], component: SponsorsComponent},
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login', pathMatch: 'full' }
];

export const AppRoutingModule = RouterModule.forRoot(appRoutes);
