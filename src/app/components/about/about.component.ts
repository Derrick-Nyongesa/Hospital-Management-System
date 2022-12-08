import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Profile } from 'src/app/profile';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import firebase from 'firebase/app';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  profile: Profile;
  currentId: string;
  selected!: Date | null;
  user: Observable<any>;
  userEmail: any;

  name: any;
  username: any;
  uid: any;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private auth: AuthService,
    private profileService: ProfileService
  ) {
    firebase
      .database()
      .ref('users/')
      .on('value', (snapshot: any) => {
        snapshot.forEach((childSnapshot: any) => {
          const childKey = childSnapshot.key;
          const childData = childSnapshot.val();
          this.username = childData.displayName;
          this.uid = childKey;
          console.log(this.username);
        });
      });
    this.findProfiles();
    this.auth.user.subscribe(
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

  findProfiles() {}

  ngOnInit(): void {
    this.user.subscribe((user) => {
      if (user) {
        this.userEmail = user.email;
        console.log(user);
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}
