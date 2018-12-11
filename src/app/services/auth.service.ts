import {Injectable} from '@angular/core';
import {IUser} from '../users/user.model'
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthService{

  private currentUserSubject: BehaviorSubject<IUser>;
  public currentUser: Observable<IUser>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<IUser>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): IUser {
    return this.currentUserSubject.value;
  }

  logUser(user: any) {
    console.log(user);
    return this.http.post<any>('http://admin.lvh.me:3000/login', user)
    .pipe(map(user => {

      // login successful if there's a jwt token in the response
      if (user && user.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));
          console.log(user)
          this.currentUserSubject.next(user);
      }
      console.log('fuera')
      return user;
    }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
  public get loggedIn(): boolean {
    return (localStorage.getItem('currentUser') !== null);
  }
}


