import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  hide = true;

  email: any;
  password: any;
  confirmPassword: any;
  displayName: any;

  constructor(
    public authService: AuthService,
    private toastr: ToastrService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {}

  // tslint:disable-next-line: typedef
  onSubmit(formData) {
    if (formData.valid) {
      console.log(formData.value);
      this.authService.emailSignup(
        formData.value.displayName,
        formData.value.email,
        formData.value.password,
        formData.value.confirmPassword
      );
    }
    // this.toastr.success('Verify your email address to login');
    this.snack.open('Verify your email address to login', 'Ok', {
      duration: 8000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['green-snackbar'],
    });
  }
}
