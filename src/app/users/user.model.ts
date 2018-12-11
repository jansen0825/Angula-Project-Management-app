import { TokenType } from "@angular/compiler";

export interface IUser{
  id_member: any;
  id:number
  name:string
  last:string
  username:string
  email: string
  description: string
  age	: number
  git	: string
  url	: string
  twitter: string
  created_in: Date
  modifyed_in: Date
  id_account: number
  id_rol: number
  profile_pic: string
  token: TokenType
  images
  enrolled_projects:any
}
