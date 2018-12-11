import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { FileSelectDirective } from 'ng2-file-upload';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { ProjectsComponent } from './projects/projects.component';
import { LoginComponent } from './login/login.component';
import { UsersComponent } from './users/users.component';
import { AuthService } from './services/auth.service';
import { AlertComponent } from './alert/alert.component';
import { AuthGuard } from './guards/auth.guard';
import { AlertService } from './services/alert.service';
import { ErrorInterceptor } from './services/error.interceptor';
import { JwtInterceptor } from './services/jwt.interceptor';
import { ApiServiceService } from './services/api-service.service';
import { ProjectDetailComponent } from './projects/project-detail.component';
import { SponsorsComponent } from './sponsors/sponsors.component';
import { ConfirmationDialogService } from './confirmation-dialog/confirm-dialog.service';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfirmationDialogComponent,
    ProjectsComponent,
    LoginComponent,
    UsersComponent,
    AlertComponent,
    ProjectDetailComponent,
    FileSelectDirective,
    SponsorsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule.forRoot()
  ],
  providers: [AuthGuard,
            AlertService,
            AuthService,
            ConfirmationDialogService,
            ApiServiceService,
            { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
            { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },],

  bootstrap: [AppComponent],
  entryComponents: [ ConfirmationDialogComponent ],
})
export class AppModule { }
