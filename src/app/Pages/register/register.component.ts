import { Component, OnInit, inject } from '@angular/core';
import { AuthsService } from '../../services/auths.service';
import { Router } from '@angular/router';
import { FacebookLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  constructor(private router : Router,private authsService : AuthsService, private socialAuthServiceConfig: SocialAuthService, private http: HttpClient){}
  
  tokenKey = "token"
  form!: FormGroup;
  fb = inject(FormBuilder);
  decodedToken: any | null;
  hide = true;
  
  apiUrl = environment.apiUrl;

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      confirmPassword: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', Validators.required],
    });
  }

  register() {
    if (this.form.invalid || !this.passwordsMatch()) {
      alert("Passwords do not match!");
      return;
    }

    this.authsService.register(this.form.value).subscribe({
      next: (response) => {
        console.log(response);
        this.router.navigateByUrl('/login');
        this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/home']); // Navigate to the home page
          setTimeout(() => {
            window.location.reload(); // Reload the page after a short delay
          }, 10); // Adjust the delay as needed
        });
      },
      error: (err) => {
        console.log(err.error.message);
        alert(err.error.message)
      }
    });
  }

  passwordsMatch(): boolean {
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  signInWithFacebook(): void {
    this.socialAuthServiceConfig.signIn(FacebookLoginProvider.PROVIDER_ID).then((user: SocialUser) => {
      this.sendTokenToAPI(user.provider, user.id, user.email, user.firstName, user.lastName, user.photoUrl);
    });
  }

  sendTokenToAPI(provider: string, providerKey: string, email: string, firstName: string, lastName: string, photoUrl: string): void {
    console.log("Well!")
      this.http.post<any>(`${this.apiUrl}Auth/ExternalLogin`, { provider, providerKey, email, firstName, lastName, photoUrl }).subscribe(
        response => {
          if (response.isSuccess) {
            localStorage.setItem(this.tokenKey, response.token)
          }
          this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/home']);
              setTimeout(() => {
              window.location.reload();
              }, 1);
          });
        },
        error => {
          console.error('Error sending token', error);
          // Handle error if needed
        }
      );
  }
}