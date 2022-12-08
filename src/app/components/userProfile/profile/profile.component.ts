import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Profile } from 'src/app/profile';
import { User } from 'src/app/user';
import { ProfileService } from 'src/app/services/profile.service';
import { FileService } from 'src/app/services/files/file-service.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  selected!: Date | null;
  user: Observable<any>;
  userEmail: any;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  name = '!!!';
  viewMode = 'tab1';
  closeResult: string = '';
  selectedImage: any = null;
  url: string;
  id: string;
  file: string;
  route: any;
  profile: Profile;
  currentId: string;
  departmentInput: string;
  positionInput: string;
  contactInput: number;
  displayNameInput: string;
  imageInput: string;
  bioInput: string;
  constructor(
    public authService: AuthService,
    private auth: AuthService,
    private breakpointObserver: BreakpointObserver,
    private profileService: ProfileService,
    @Inject(AngularFireStorage)
    private storage: AngularFireStorage,
    @Inject(FileService)
    private fileService: FileService,
    private modalService: NgbModal
  ) {
    this.findProfiles();
    this.authService.user.subscribe(
      (user) => {
        this.currentId = user.uid;
        console.log(this.currentId);
        this.profileService.fetchProfileApi(this.currentId).subscribe(
          (res) => {
            this.profile = res;
            console.log(res);
          },
          (error) => {
            console.error(error);
          }
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }
  // tslint:disable-next-line: typedef
  findProfiles() {}
  // tslint:disable-next-line: typedef
  updateProfile() {
    this.profile.department = this.departmentInput;
    this.profile.position = this.positionInput;
    this.profile.contact = this.contactInput;
    this.profile.displayName = this.displayNameInput;
    this.profile.image = this.imageInput;
    this.profile.bio = this.bioInput;
    var name = this.selectedImage.name;
    const path = `profiles/${this.currentId}/${name}`;
    const fileRef = this.storage.ref(path);
    this.storage
      .upload(path, this.selectedImage)
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.profile.image = url;
            this.profileService.update(this.currentId, this.profile);
          });
        })
      )
      .subscribe();
  }
  // profile: Profile;
  // currentUser: User;
  // isUser: boolean;
  ngOnInit(): void {
    this.fileService.getImageDetailList();
  }
  // tslint:disable-next-line: typedef
  signOut() {
    this.authService.logout();
  }
  // tslint:disable-next-line: typedef
  showPreview(event: any) {
    this.selectedImage = event.target.files[0];
  }
  // tslint:disable-next-line: typedef
  view() {
    this.fileService.getImage(this.file);
  }

  logout() {
    this.auth.logout();
  }

  open(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
