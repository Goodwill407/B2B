import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core';

@Component({
  selector: 'app-user-category',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './user-category.component.html',
  styleUrl: './user-category.component.scss'
})
export class UserCategoryComponent {

  constructor(public authService: AuthService,private fb:FormBuilder){}

  userForm!:FormGroup;

  ngOnInit(){
    this.userForm = this.fb.group({
      userCategory:['', [Validators.required]]
    });
    if(this.authService.currentUserValue.userCategory){
      this.userForm.patchValue({userCategory: this.authService.currentUserValue.userCategory});
      this.userForm.controls['userCategory'].disable();
    }
  }

  submitData(){
    const userData = this.userForm.value;
    const user = this.authService.currentUserValue;
    userData.id = user.id;
    this.authService.patch('users',userData).subscribe((res:any)=>{
      user.userCategory = res.userCategory;
      this.authService.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      window.location.reload();
      console.log(res);
    })
  }
}
