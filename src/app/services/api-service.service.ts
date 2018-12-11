import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { IProject, Project } from '../projects/iproject';
import { IProjectData } from '../projects/iprojectsData';
import { IUser } from '../users/user.model';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  private projectUrl = 'http://admin.lvh.me:3000/projects';
  private userUrl = 'http://admin.lvh.me:3000/users';
  private partnerUrl = 'http://admin.lvh.me:3000/partners';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.userUrl).pipe(
      tap(data => console.log('Users: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  getPartners(): Observable<any[]> {
    return this.http.get<any[]>(this.partnerUrl).pipe(
      tap(data => console.log('Partners: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  getProjects(): Observable<IProjectData> {
    return this.http.get<IProjectData>(this.projectUrl).pipe(
      tap(data => console.log('All: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

    getProject(id: number): Observable<Project | undefined> {
    return this.http.get<Project>(`${this.projectUrl}/${id}`).pipe(
      tap(data => console.log('Project: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  editProject(project: IProject): Observable<any | undefined> {
    return this.http.put<any>(`${this.projectUrl}/${project.id}`, project)
  }

  deleteProject(id: number): Observable<any | undefined> {
    return this.http.delete<any>(`${this.projectUrl}/${id}`)
  }

  deletePartner(id: number): Observable<any | undefined> {
    return this.http.delete<any>(`${this.partnerUrl}/${id}`)
  }

  deletePdf(pdf_id: number, project_id: number): Observable<any | undefined> {
    return this.http.delete<any>(`${this.projectUrl}/${project_id}/progress/${pdf_id}`)
  }

  deletePhoto(photo_id: number, project_id: number): Observable<any | undefined> {
    return this.http.delete<any>(`${this.projectUrl}/${project_id}/photos/${photo_id}`)
  }

  deleteProjectMember(member_id: number, project_id: number): Observable<any | undefined> {
    return this.http.delete<any>(`${this.projectUrl}/${project_id}/addmembers/${member_id}`)
  }

  deleteProjectPartner(partner_id: number, project_id: number): Observable<any | undefined> {
    return this.http.delete<any>(`${this.projectUrl}/${project_id}/addpartner/${partner_id}`)
  }

  addProject(project: any): Observable<any>{
    return  this.http.post<any>('http://admin.lvh.me:3000/projects', project)
    .pipe(tap(data => console.log('Added: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  addPartner(partner: any): Observable<any>{
    return  this.http.post<any>(this.partnerUrl, partner)
    .pipe(tap(data => console.log('Added: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  addPdf(data: any): Observable<any>{
    return this.http.post<any>(`${this.projectUrl}/${data.id_project}/progress`, data)
    .pipe(tap(data => console.log('Pdf Added: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  addProjectMember(data){
    return this.http.post<any>(`${this.projectUrl}/${data.id_project}/addmembers`, data)
    .pipe(tap(data => console.log('Member Added: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  addProjectPartner(data){
    return this.http.post<any>(`${this.projectUrl}/${data.id_project}/addpartner`, data)
    .pipe(tap(data => console.log('Partner Added: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  addPhoto(data: any): Observable<any>{
    return this.http.post<any>(`${this.projectUrl}/${data.id_project}/photos`, data)
    .pipe(tap(data => console.log('Photo Added: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  private handleError(err: HttpErrorResponse) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
