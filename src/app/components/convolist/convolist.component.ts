import { ChatService } from 'src/app/services/chat/chat.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import firebase from 'firebase/app';
import 'firebase/auth';
import { AuthService } from 'src/app/services/auth/auth.service';
import { User } from 'src/app/classes/user/user';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ProfileService } from 'src/app/services/profile.service';
import { Profile } from 'src/app/profile';

@Component({
  selector: 'app-convolist',
  templateUrl: './convolist.component.html',
  styleUrls: ['./convolist.component.css'],
})
export class ConvolistComponent implements OnInit {
  convoname: string;
  user: any;
  userId: any;
  userName: any;
  chatname: any;
  displayedColumns: string[] = ['roomname'];
  conversations: any;
  isLoadingResults = true;
  receiver: any;
  uid: any;
  currentId: string;
  profile: Profile;
  userid: string;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private Auth: AngularFireAuth,
    private breakpointObserver: BreakpointObserver,
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private chat: ChatService,
    private profileService: ProfileService
  ) {
    this.Auth.authState.subscribe((auth) => {
      if (auth !== undefined && auth !== null) {
        this.user = auth;
        this.userid = this.user.uid;

        firebase
          .database()
          .ref('conversations/')
          .on('value', (resp) => {
            //this.conversations = [];
            console.log(this.user.uid);
            this.conversations = this.snapshotToArray(resp, this.userid);
            console.log(this.conversations);
            this.isLoadingResults = false;
          });
      }
      this.getUser()
        .valueChanges()
        .subscribe((a) => {
          this.userName = a;
          this.chatname = this.userName.displayName;
        });
    });

    // firebase.database().ref('conversations/').on('value', (snapshot: any) => {
    //   snapshot.forEach((childSnapshot: any) => {
    //     var childKey = childSnapshot.key;
    //     var childData = childSnapshot.val();
    //     this.conversations=[]
    //     this.conversations = childData
    //     console.log(this.conversations)
    //     this.userId = this.conversations.sender
    //     console.log(this.userId)
    //     this.receiver = this.conversations.receiver
    //     console.log(this.receiver)

    //   });
    // });
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

  getUser() {
    const userId = this.user.uid;
    const path = `/users/${userId}`;
    return this.db.object(path);
  }

  getConvo(convo: any) {
    this.chat.setConvoname(convo.convoname);
    console.log(this.convoname);
    return this.convoname;
  }

  getCurrent(userId: string) {
    let currentuser;
    firebase
      .database()
      .ref('users/')
      .on('value', (resp: any) => {
        resp.forEach((child: any) => {
          console.log(child.val());
          console.log(child.key);
          if (child.key === userId) {
            return child.val().displayName;
          }
        });
      });
  }

  ngOnInit(): void {
    this.chat.setConvoname(this.convoname);
  }

  logout() {
    this.auth.logout();
  }

  snapshotToArray = (snapshot: any, userId: string) => {
    const returnArr: any[] = [];

    snapshot.forEach((childSnapshot: any) => {
      let item = childSnapshot.val();
      item.key = childSnapshot.key;
      const show = userId === item.sender || userId === item.receiver;

      if (userId === item.sender) {
        firebase
          .database()
          .ref('users/')
          .on('value', (resp: any) => {
            resp.forEach((child: any) => {
              console.log(child.val());
              console.log(child.key);
              if (child.key === item.receiver) {
                item = { ...item, show, displayName: child.val().displayName };
                if (show) {
                  returnArr.push(item);
                }
              }
            });
          });
      } else {
        firebase
          .database()
          .ref('users/')
          .on('value', (resp: any) => {
            resp.forEach((child: any) => {
              console.log(child.val());
              console.log(child.key);
              if (child.key === item.sender) {
                item = { ...item, show, displayName: child.val().displayName };
                if (show) {
                  returnArr.push(item);
                }
              }
            });
          });
      }
      //const name = (userId === item.sender)?this.getCurrent(item.receiver):this.getCurrent(item.sender)
    });

    return returnArr;
  };

  enterChatRoom(displayName: string) {
    firebase
      .database()
      .ref('recipients/')
      .orderByChild('displayName')
      .equalTo(displayName)
      .on('value', (resp: any) => {
        let recipient = [];
        recipient = this.snapshotToArray(resp, this.userid);
        const user = recipient.find((x) => x.chatname === this.chatname);
      });
    this.router.navigate(['chatroom/', displayName]);
  }
}
