import { Injectable } from '@angular/core';
import { GoogleAuthProvider, signOut, getAuth } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  constructor(public router: Router, public afAuth: AngularFireAuth) { }

  GoogleAuth() {
    return this.AuthLogin(new GoogleAuthProvider());
  }

  AuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        //Sessions
        let JsonData = {
          name: result.user?.displayName,
          email: result.user?.email,
        };

        localStorage.setItem('data', JSON.stringify(JsonData));

        this.router.navigate(['dashboard']);
        console.log(
          'You have been successfully logged in!' + result.user?.displayName
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  signOut() {
    const auth = getAuth();
    localStorage.clear();
    signOut(auth).then(() => {
      // Sign-out successful.
      this.router.navigate(["login"]);

    }).catch((error) => {
      // An error happened.
    });
  }
}
