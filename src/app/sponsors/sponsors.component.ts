import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';
import { ApiServiceService } from '../services/api-service.service';
import { IUser } from '../users/user.model';
import { Subscription } from 'rxjs/internal/Subscription';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload/file-upload/file-uploader.class';
import { ConfirmationDialogService } from '../confirmation-dialog/confirm-dialog.service';

@Component({
  selector: 'app-sponsors',
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.css']
})
export class SponsorsComponent implements OnInit {
  @ViewChild('logo') myLogoFile: ElementRef;

  currentUser: IUser;
  currentUserSubscription: Subscription;
  addPartnerForm: FormGroup;
  submitted = false;
  partners: any[];
  filteredPartners: any[] = [];
  errorMessage = '';
  _listFilter: string;
  showImage = false;
  addedPartner: any;

  pageTitle = 'Project List';
  selectedLogo = null;
  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private authenticationService: AuthService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private sponsorService: ApiServiceService) {
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
        this.currentUser = user;
    });
  }

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

  ngOnInit(): void {
    this.sponsorService.getPartners().subscribe(
      data => {
        this.partners = <any[]>data;
        console.log(data)
        this.filteredPartners = this.partners;
      },
      error => {this.errorMessage = <any>error
      this.alertService.error(error);}
    );
    this.addPartnerForm = this.formBuilder.group({
      name: ['', Validators.required],
      url: ['', Validators.required],
      logo: null
  });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
         console.log('ImageUpload:uploaded:', item, status, response);
        };

  }

  performFilter(filterBy: string): any[] {
    filterBy = filterBy.toLocaleLowerCase();
    return this.partners.filter((partners: any) =>
      partners.name.toLocaleLowerCase().indexOf(filterBy) !== -1);
  }

  get f() { return this.addPartnerForm.controls; }

  get listFilter(): string {
    return this._listFilter;
  }
  set listFilter(value: string) {
    this._listFilter = value;
    this.filteredPartners = this.listFilter ? this.performFilter(this.listFilter) : this.partners;
  }

  toggleImage(): void {
    this.showImage = !this.showImage;
  }

  onLogoSelected(event){
    this.selectedLogo = event.target.files[0].name;
    this.addPartnerForm.patchValue({
      logo: this.selectedLogo
    })
  }

  onCancel() {
    this.addPartnerForm.reset();
    this.submitted = false;
    this.myLogoFile.nativeElement.value = "";
  }

  onDelete(id){
    this.sponsorService.deletePartner(id).subscribe(
      (succes) => {
        console.log(succes);
        this.alertService.error('Partner Deleted!');
        let index = this.filteredPartners.findIndex(i => i.id === id);
        this.filteredPartners.splice(index,1);
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    )
  }

  public openConfirmationDialog(id) {
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to DELETE this Partner?')
    .then((confirmed) => {
        if(confirmed)
          this.onDelete(id)
        console.log('User confirmed:', confirmed)})
    .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.addPartnerForm.invalid) {
        return;
    }
    this.uploader.uploadAll();

    console.log(this.addPartnerForm.value);
    this.sponsorService.addPartner(this.addPartnerForm.value)
        .subscribe(
     data => {
      this.addedPartner = <any>data;
      this.filteredPartners = [ this.addedPartner, ...this.filteredPartners]
      this.addPartnerForm.reset();
      this.alertService.success('Sponsor Added!', true);
      },
      error => {
        this.errorMessage = <any>error
        this.alertService.error(error);
      }
    );
    this.submitted = false;
    this.myLogoFile.nativeElement.value = "";
  }

}
