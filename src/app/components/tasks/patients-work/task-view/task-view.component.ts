import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient';
import { PatientService } from '../services/patient.service';
import { Todo } from '../models/patient-task';
import { MatDialog } from '@angular/material/dialog';
import {
  PatientDialogComponent,
  PatientDialogResult,
} from '../patient-dialog/patient-dialog.component';
import {
  PatientTaskDialogComponent,
  PatientTaskDialogResult,
} from '../patient-task-dialog/patient-task-dialog.component';
import { Profile } from 'src/app/profile';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { CurrentUser } from '../../personal-tasks/tasks/tasks.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.css'],
})
export class TaskViewComponent implements OnInit {
  patients?: Patient[];
  allTasks: any;
  doneTasks: any;
  undoneTasks: any;
  filter: 'all' | 'active' | 'done' = 'all';
  patientId!: string;
  currentId: string;
  profile: Profile;
  profiles: Profile[];
  searchMode: boolean;
  results: Patient[] = [];
  searchValue: string;
  tasksLength: number;
  user: CurrentUser;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private patientService: PatientService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private auth: AuthService,
    private profileService: ProfileService,
    private store: AngularFirestore,
    private breakpointObserver: BreakpointObserver,
    private snack: MatSnackBar
  ) {
    this.auth.user.subscribe(
      (user) => {
        this.currentId = user.uid;
        this.profileService.fetchProfileApi(this.currentId).subscribe(
          (res) => {
            this.profile = res;
            this.user = {
              name: res.displayName,
              email: res.email,
            };
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

  ngOnInit(): void {
    this.searchMode = false;
    this.patientService
      .getAll()
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data(),
          }))
        )
      )
      .subscribe((data) => {
        this.patients = data;
      });

    this.route.params.subscribe((params: Params) => {
      console.log(params);
      this.patientId = params.patientId;

      this.allTasks = this.patientService.getPatientTasks(params.patientId);

      this.doneTasks = this.patientService.getDoneTasks(params.patientId);
      this.undoneTasks = this.patientService.getUndoneTasks(params.patientId);
    });
    this.patientService.getDoneTasks(this.patientId);
  }

  get tasks() {
    if (this.filter === 'all') {
      return this.allTasks;
    } else if (this.filter == 'active') {
      return this.undoneTasks;
    }
    return this.doneTasks;
  }

  complete(task: Todo) {
    task.done = true;
    if (task.id) {
      this.patientService.updateTask(this.patientId, task.id, task);
    }
  }

  continue(task: Todo) {
    task.done = false;
    if (task.id) {
      this.patientService.updateTask(this.patientId, task.id, task);
    }
  }

  deleteTask(task: Todo) {
    if (task.id) {
      this.patientService.deleteTask(this.patientId, task.id);
    }
  }

  newPatient(): void {
    const dialogRef = this.dialog.open(PatientDialogComponent, {
      width: '500px',
      data: {
        patient: {},
      },
    });
    dialogRef.afterClosed().subscribe((result: PatientDialogResult) => {
      this.patients.forEach((patientItem) => {
        if (patientItem.id === result.patient.id) {
          // this.toastr.warning("Patient with name already exists", "Name already exists")
          this.snack.open(
            'Patient with name already exists", "Name already exists',
            'Ok',
            {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['red-snackbar'],
            }
          );
          this.router.navigate(['./'], { relativeTo: this.route });
        }
      });

      this.patientService.addPatient(
        result.patient.firstName.concat(result.patient.lastName),
        result.patient
      );
    });
  }

  editPatient(patient: Patient): void {
    const dialogRef = this.dialog.open(PatientDialogComponent, {
      width: '500px',
      data: {
        patient,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: PatientDialogResult) => {
      if (result.delete) {
        this.patientService.removePatient(patient.id);
      } else {
        this.patientService.updatePatient(patient.id, patient);
      }
    });
  }

  newPatientTask(): void {
    const newdialogRef = this.dialog.open(PatientTaskDialogComponent, {
      width: '500px',
      data: {
        task: {},
      },
    });
    newdialogRef.afterClosed().subscribe((result: PatientTaskDialogResult) => {
      result.task.done = false;
      if (result.task.title && result.task.assignedTo && result.task.dateDue) {
        this.patientService.addTask(this.patientId, result.task);
      } else {
        //  alert("invalid task. Please enter the correct details");
        //  this.toastr.error("Please enter all the details", "Incorrect task format")
        this.snack.open(
          'Please enter all the details", "Incorrect task format',
          'Ok',
          {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['red-snackbar'],
          }
        );
      }
    });
  }

  editPatientTask(task: Todo) {
    const newdialogRef = this.dialog.open(PatientTaskDialogComponent, {
      width: '500px',
      data: {
        task,
        enableDelete: true,
      },
    });
    newdialogRef.afterClosed().subscribe((result: PatientTaskDialogResult) => {
      this.patientService.updateTask(this.patientId, task.id, task);
    });
  }

  deletePatient(patient: Patient): void {
    this.patientService.removePatient(patient.id);
    this.router.navigate(['/patients']);
  }

  performSearch() {
    if (this.searchValue) {
      this.patients.filter((item) => {
        console.log(item.firstName === this.searchValue);
        if (item.firstName === this.searchValue) {
          console.log(item);
          this.results.push(item);
          this.searchMode = true;
        }
      });
      this.patients = this.results;
      // this.searchValue = '';
    }
    if (this.searchValue === '') {
      return this.patients;
    }
  }

  clearSearch() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
