import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { Profile } from 'src/app/profile';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CurrentUser } from '../tasks/tasks.component';

@Component({
  selector: 'app-tasks-home',
  templateUrl: './tasks-home.component.html',
  styleUrls: ['./tasks-home.component.css'],
})
export class TasksHomeComponent implements OnInit {
  profile: Profile;
  currentId: string;
  uid: any;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  user: CurrentUser;

  activeTab = 0;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private ngxService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.ngxService.start(); // start foreground spinner of the master loader with 'default' taskId
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground spinner of the master loader with 'default' taskId
    }, 2000);
  }
}
