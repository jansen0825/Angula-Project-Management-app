import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { IProject } from './iproject';
import { ApiServiceService } from '../services/api-service.service';
import { AuthService } from '../services/auth.service';
import { IUser } from '../users/user.model';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { AlertService } from '../services/alert.service';
import { FileUploader } from 'ng2-file-upload';
import { ConfirmationDialogService } from '../confirmation-dialog/confirm-dialog.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  @ViewChild('main') myMainFile: ElementRef;
  @ViewChild('banner') myBannerFile: ElementRef;

  currentUser: IUser;
  currentUserSubscription: Subscription;
  addProjectForm: FormGroup;
  submitted = false;

  pageTitle = 'Project List';
  imageWidth = 50;
  imageMargin = 2;
  showImage =  false;
  filteredProjects: IProject[] = [];
  projects: IProject[] = [];
  addedProject: IProject;
  errorMessage = '';
  _listFilter: string;

  selectedPhoto = null;
  selectedBanner = null;

  // This methos executes after a photo is selected
  onPhotoSelected(event){
    this.selectedPhoto = event.target.files[0].name;
    this.addProjectForm.patchValue({
      main_pic: this.selectedPhoto
    })
  }
  // This methos executes after a banner is selected
  onBannerSelected(event){
    this.selectedBanner = event.target.files[0].name;
    this.addProjectForm.patchValue({
      banner_pic: this.selectedBanner
    })
  }
  // Uploader settings to permit file transfer
  public uploader: FileUploader = new FileUploader({
    url: 'http://admin.lvh.me:3000/projects',
    authTokenHeader: "Authorization",
    authToken: `Bearer ${this.authenticationService.currentUserValue.token}`,
    isHTML5: true,
    itemAlias: 'project_photo',
    headers: [{
    name: "myCustomHeader",
    value: "some value"
    }]
    });

  // Filters the project list by name
  performFilter(filterBy: string): IProject[] {
    filterBy = filterBy.toLocaleLowerCase();
    return this.projects.filter((projects: IProject) =>
      projects.name.toLocaleLowerCase().indexOf(filterBy) !== -1);
  }
  // gets the filter key
  get listFilter(): string {
    return this._listFilter;
  }
  // sets the filter key
  set listFilter(value: string) {
    this._listFilter = value;
    this.filteredProjects = this.listFilter ? this.performFilter(this.listFilter) : this.projects;
  }
  // function to acces form controlls
  get f() { return this.addProjectForm.controls; }

  // Shows and hides projects main photo
  toggleImage(): void {
    this.showImage = !this.showImage;
  }

  // Initiate a new project window and its services.
  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private authenticationService: AuthService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private projectService: ApiServiceService) {
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
        this.currentUser = user;
    });
  }

  //This methos executes at the page load. Also brings all the projects
  ngOnInit(): void {
    this.projectService.getProjects().subscribe(
      data => {
        this.projects = <IProject[]>data.data.projects;
        console.log(data.data.projects)
        this.filteredProjects = this.projects;
      },
      error => this.errorMessage = <any>error
    );
    this.addProjectForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      git: null,
      state: 'ACTIVE',
      external_url: null,
      tag: 'IOT',
      main_pic: null,
      banner_pic: null
  });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
         console.log('ImageUpload:uploaded:', item, status, response);
         //alert('File uploaded successfully');
    };
  }

  //This methos executes when the user cancels the form
  onCancel() {
    this.addProjectForm.reset();
    this.submitted = false;
    this.myMainFile.nativeElement.value = "";
    this.myBannerFile.nativeElement.value = "";
  }
  //This methos executes when the user confirms the deletion of a project
  onDelete(id){
    this.projectService.deleteProject(id).subscribe(
      (succes) => {
        console.log(succes);
        this.alertService.error('Project Deleted!');
        let index = this.filteredProjects.findIndex(i => i.id === id);
        this.filteredProjects.splice(index,1);
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    )
  }
  //This methos executes when the user clicks the delete project button
  public openConfirmationDialog(id) {
    this.confirmationDialogService.confirm('Please confirm..',
    'Do you really want to DELETE this project?')
    .then((confirmed) => {
        if(confirmed)
          this.onDelete(id)
        console.log('User confirmed:', confirmed)})
    .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

  //This methos executes when the user submits the new project form.
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.addProjectForm.invalid) {
        return;
    }
    this.uploader.uploadAll();

    console.log(this.addProjectForm.value);
    this.projectService.addProject(this.addProjectForm.value)
        .subscribe(
     data => {
      this.addedProject = <any>data.project;
      console.log(data.project.id)
      this.filteredProjects = [ this.addedProject, ...this.filteredProjects]
      //this.filteredProjects.push(this.addedProject);
      this.addProjectForm.reset();
      this.alertService.success('Project Added!', true);
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    );
    this.submitted = false;
    this.myMainFile.nativeElement.value = "";
    this.myBannerFile.nativeElement.value = "";

  }
}
