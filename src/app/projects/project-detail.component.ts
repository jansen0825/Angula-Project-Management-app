import { Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import { AuthService } from '../services/auth.service';

import { AlertService } from '../services/alert.service';
import { ApiServiceService } from '../services/api-service.service';
import { IUser } from '../users/user.model';
import { Subscription } from 'rxjs';
import { IProject, Project } from './iproject';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload/file-upload/file-uploader.class';
import { ConfirmationDialogService } from '../confirmation-dialog/confirm-dialog.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  // Class atributes
  @ViewChild('pdf') myMainFile: ElementRef;
  @ViewChild('photo') myNewPhoto: ElementRef;
  currentUser: IUser;
  currentUserSubscription: Subscription;
  isMember: boolean;
  project: IProject;
  projectForm: FormGroup;
  progressForm: FormGroup;
  errorMessage = '';
  submited = false;
  pdf_submited = false;
  months =['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September','October', 'November', 'December'];
  selectedPhoto = null;
  selectedBanner = null;
  selectedPdf = null;
  selectedNewPhoto = null;
  addedProgress: any;
  addedPhoto:any;
  addMember = false;
  addPartner = false;
  users: IUser[];
  sponsors: any[];

  // File Uploads SetUp
  public uploader: FileUploader = new FileUploader({
    url: `http://admin.lvh.me:3000/projects`,
    authTokenHeader: "Authorization",
    authToken: `Bearer ${this.authenticationService.currentUserValue.token}`,
    isHTML5: true,
    itemAlias: 'project_photo',
    headers: [{
    name: "myCustomHeader",
    value: "some value"
    }]
    });

    // Class constructor and instance initialization
  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authenticationService: AuthService,
    private alertService: AlertService,
    private projectService: ApiServiceService) {
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
        this.currentUser = user;
    });
  }

  // This methos executes at screen initialization
  ngOnInit() {
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      const id = +param;
      this.getProject(id)
    }
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
         console.log('ImageUpload:uploaded:', item, status, response);
    };
  }
  // This method gets the specified project
  getProject(id: number) {
  this.projectService.getProject(id).subscribe(
    data => {
      this.project = <IProject>data.project;
      this.createProjectForm(this.project)
      this.createProgresstForm();
      console.log(this.project);
      let flag = this.project.members.find(x => x.id == this.currentUser.id_member);
      if (flag !== undefined)
        this.isMember = true;
    },
    error => this.alertService.error(error)
  )};
  get f() { return this.projectForm.controls; }
  get r() { return this.progressForm.controls; }

  // This method creates the project form
  createProjectForm(project){
    return this.projectForm = this.formBuilder.group({
    id: project.id,
    name: [project.name.toUpperCase(), Validators.required],
    description: [project.description, Validators.required],
    git: project.git,
    state: project.state.toUpperCase(),
    external_url: project.external_url,
    tag: project.tag.toUpperCase(),
    main_pic: project.main_pic,
    banner_pic: project.banner_pic,
    is_top: project.is_top
    });
  }
  // This method handles the photo selected event
  onMainPhotoSelected(event){
    this.selectedPhoto = event.target.files[0].name;
    this.projectForm.patchValue({
      main_pic: this.selectedPhoto
    })
  }
  // This method handles the photo selected event
  onNewPhotoSelected(event){
    this.selectedNewPhoto = event.target.files[0].name;
  }
  // This method handles the photo selected event
  onBannerSelected(event){
    this.selectedBanner = event.target.files[0].name;
    this.projectForm.patchValue({
      banner_pic: this.selectedBanner
    })
  }
  // This method handles the PDF selected event
  onPdfSelected(event){
    this.selectedPdf = event.target.files[0].name;
    this.progressForm.patchValue({
      pdf_atached: this.selectedPdf
    })
  }

  // This method creates the pfogress form
  createProgresstForm(){
    return this.progressForm = this.formBuilder.group({
        id_project: this.project.id,
        summary: ['', Validators.required],
        pdf_atached: [null, Validators.required]
      });
  }
  // This method executes when canceling a photo
  onCancelNewPhoto(){
    this.myNewPhoto.nativeElement.value = "";
    this.selectedNewPhoto = null;
  }
  // This method executes whene cancelling the pfogress form
  onCancelPdfForm(){
    this.myMainFile.nativeElement.value = "";
    this.progressForm.reset();
  }

  // This method executes whene submitting a form
  onSubmitPhoto(){
    if (this.selectedNewPhoto === null) {
      return;
    }
    this.uploader.uploadAll();
    let data = {id_project: this.project.id,
      name: this.selectedNewPhoto
    };
    this.projectService.addPhoto(data)
        .subscribe(
     data => {
      this.addedPhoto = <any>data.image;
      console.log(data.image)
      this.project.images = [ this.addedPhoto, ...this.project.images];
      this.alertService.success('Image Added!', true);
      this.onCancelNewPhoto();
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    );
  }

  // This method executes whene managing members
  onManageMembers(){
    if(this.addMember === true){
      this.addMember = false;
      return;
    }
    this.addMember = true;
    this.projectService.getUsers().subscribe(
      data => {
        let allUsers = <IUser[]>data;
        this.users = allUsers.filter(function(allUsers){
          return allUsers.id_rol === 2;});
        let out = new Array;
        for(let i = 0; i < this.users.length; i++){
          for(let y = 0; y < this.users[i].enrolled_projects.length; y++){
            if(this.users[i].enrolled_projects[y].id === this.project.id){
              out.push(i)
            }
          }
        }

      out.sort((a: any, b: any) => b-a);
      out.forEach(element => {
        this.users.splice(element,1);
      });
        console.log(this.users)
        //this.filteredProjects = this.projects;
      },
      error => {this.errorMessage = <any>error
      this.alertService.error(error);}
    );

  }

  // This method executes whene managing partners
  onManagePartner(){
    if(this.addPartner === true){
      this.addPartner = false;
      return;
    }
    this.addPartner = true;
    this.projectService.getPartners().subscribe(
      data => {
        this.sponsors = <any[]>data;

        let out = new Array;
        for(let i = 0; i < this.sponsors.length; i++){
          for(let y = 0; y < this.project.partners.length; y++){
            if(this.sponsors[i].id === this.project.partners[y].id){
              out.push(i)
            }
          }
        }
      out.sort((a: any, b: any) => b-a);
      out.forEach(element => {
        this.sponsors.splice(element,1);
      })},
      error => {this.errorMessage = <any>error
      this.alertService.error(error);}
    );
  }

  // This method executes whene submitting a pdf form
  onSubmitPdf(){
    this.pdf_submited = true;
    if (this.progressForm.invalid) {
      return;
    }
    this.uploader.uploadAll();
    this.projectService.addPdf(this.progressForm.value)
        .subscribe(
     data => {
      this.addedProgress = <any>data.progress;
      console.log(data.progress)
      this.project.progress = [ this.addedProgress, ...this.project.progress]
      //this.filteredProjects.push(this.addedProject);
      this.progressForm.reset();
      this.alertService.success('PDF Added!', true);
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    );
    this.pdf_submited = false;
    this.myMainFile.nativeElement.value = "";
  }

  // This method executes whene deleting a pdf form
  onDeletePdf(pdf_id, project_id){
    this.projectService.deletePdf(pdf_id, project_id).subscribe(
      (succes) => {
        console.log(succes);
        this.alertService.success('Update Deleted!', true);
        let index = this.project.progress.findIndex(i => i.id === pdf_id);
        this.project.progress.splice(index,1);
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    )
  }

  // This method executes whene confirming a deletion
  public openPDFConfirmationDialog(pdf_id, project_id) {
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to DELETE this Update?')
    .then((confirmed) => {
        if(confirmed)
          this.onDeletePdf(pdf_id, project_id)
        console.log('User confirmed:', confirmed)})
    .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

  // This method executes whene deleting a photo
  onDeletePhoto(photo_id, project_id){
    this.projectService.deletePhoto(photo_id, project_id).subscribe(
      (succes) => {
        console.log(succes);
        this.alertService.success('Image Deleted!', true);
        let index = this.project.images.findIndex(i => i.id === photo_id);
        this.project.images.splice(index,1);
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    )
  }

  // This method executes whene confirming a deletion
  public openConfirmationDialog(photo_id, project_id) {
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to DELETE this photo?')
    .then((confirmed) => {
        if(confirmed)
          this.onDeletePhoto(photo_id, project_id)
        console.log('User confirmed:', confirmed)})
    .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

  // This method executes whene removing a member
  onMemberClicked(index){
    this.users = [ this.project.members[index], ...this.users];
    this.projectService.deleteProjectMember(this.project.members[index].id, this.project.id )
        .subscribe(
     data => {
      console.log(data)
      this.project.members.splice(index,1);
      this.alertService.success('Member Deleted!', true);
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    );
  }

  // This method executes whene adding a member
  onUserClicked(index){
    this.project.members = [ this.users[index], ...this.project.members];
    let data = {id_project: this.project.id,
    id_member: this.users[index].id}
    this.projectService.addProjectMember(data)
        .subscribe(
     data => {
      console.log(data)
      this.users.splice(index,1);
      this.alertService.success('Member Added!', true);
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    );
  }

  // This method executes whene removing a partner
  onPartnerClicked(index){
    this.sponsors = [ this.project.partners[index], ...this.sponsors];
    this.projectService.deleteProjectPartner(this.project.partners[index].id, this.project.id )
        .subscribe(
     data => {
      console.log("P Del")
      this.project.partners.splice(index,1);
      this.alertService.success('Partner Deleted!', true);
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    );
  }

  // This method executes whene adding a sponsor
  onSponsorClicked(index){
    this.project.partners = [ this.sponsors[index], ...this.project.partners];
    let data = {id_project: this.project.id,
    id_partner: this.sponsors[index].id}
    this.projectService.addProjectPartner(data)
        .subscribe(
     data => {
      console.log(data)
      this.sponsors.splice(index,1);
      this.alertService.success('Partner Added!', true);
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    );
  }

  // This method executes whene submitting the form
  onSubmit() {
    this.submited = true;
    if (this.projectForm.invalid) {
      return;
    }
    if(this.selectedPhoto !== null){
      this.project.main_pic = this.selectedPhoto;

    }
    if(this.selectedBanner !== null)
      this.project.banner_pic = this.selectedBanner;

    if(this.selectedPhoto !== null || this.selectedBanner !== null){
      this.uploader.uploadAll();
    }

    this.projectService.editProject(this.projectForm.value)
        .subscribe(
     data => {
      console.log(data)
      this.alertService.success('Project Modified!', true);
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    );

    this.submited = false;
  }

}
