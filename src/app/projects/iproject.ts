// This is the Project and Projects interfaces
export interface IProject {
      id: number;
      name: string;
      created_in: Date;
      description: string;
      git: string;
      state: string;
      external_url: string;
      ended_in: Date;
      main_pic: string;
      banner_pic: string;
      tag: string;
      is_top: boolean;
      images ;
      members;
      progress;
      partners;
}
export interface Project {
  project:{
    id: number;
    name: string;
    created_in: Date;
    description: string;
    git: string;
    state: string;
    external_url: string;
    ended_in: Date;
    main_pic: string;
    banner_pic: string;
    tag: string;
    is_top: boolean;
    images;
    members;
    progress;
    partners;

  }
}
