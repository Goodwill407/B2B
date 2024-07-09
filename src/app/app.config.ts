// import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient } from '@angular/common/http';
// import { ApplicationConfig, importProvidersFrom } from '@angular/core';
// import { APP_ROUTE } from './app.routes';
// import { provideRouter } from '@angular/router';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { HashLocationStrategy, LocationStrategy } from '@angular/common';
// import { JwtInterceptor } from '@core/interceptor/jwt.interceptor';
// import { ErrorInterceptor } from '@core/interceptor/error.interceptor';
// import { DirectionService, LanguageService } from '@core';
// import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
// import { MomentDateAdapter } from '@angular/material-moment-adapter';
// import { FeatherModule } from 'angular-feather';
// import { allIcons } from 'angular-feather/icons';
// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { provideAuth, getAuth } from '@angular/fire/auth';
// import { environments } from '../environments/environment';


// export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

// export const appConfig: ApplicationConfig = {
//     providers: [
//         provideHttpClient(),
//         provideRouter(APP_ROUTE),
//         provideAnimations(),
//         { provide: LocationStrategy, useClass: HashLocationStrategy },
//         { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
//         { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
//         DirectionService, LanguageService,
//         importProvidersFrom(
//             TranslateModule.forRoot({
//                 defaultLanguage: 'en',
//                 loader: {
//                     provide: TranslateLoader,
//                     useFactory: createTranslateLoader,
//                     deps: [HttpClient],
//                 },
//             })
//         ),
//         { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
//         { provide: DateAdapter, useClass: MomentDateAdapter },
//         {
//             provide: MAT_DATE_FORMATS,
//             useValue: {
//                 parse: {
//                     dateInput: 'YYYY-MM-DD',
//                 },
//                 display: {
//                     dateInput: 'YYYY-MM-DD',
//                     monthYearLabel: 'YYYY MMM',
//                     dateA11yLabel: 'LL',
//                     monthYearA11yLabel: 'YYYY MMM',
//                 },
//             },
//         },
//         importProvidersFrom(
//             FeatherModule.pick(allIcons),
//             provideFirebaseApp(() => initializeApp(environments.firebase)),
//             provideAuth(() => getAuth())
//         )
//     ],
// };

import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { APP_ROUTE } from './app.routes';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { JwtInterceptor } from '@core/interceptor/jwt.interceptor';
import { ErrorInterceptor } from '@core/interceptor/error.interceptor';
import { DirectionService, LanguageService } from '@core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environments } from '../environments/environment';

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(),
        provideRouter(APP_ROUTE),
        provideAnimations(),
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        DirectionService, LanguageService,
        importProvidersFrom(
            TranslateModule.forRoot({
                defaultLanguage: 'en',
                loader: {
                    provide: TranslateLoader,
                    useFactory: createTranslateLoader,
                    deps: [HttpClient],
                },
            })
        ),
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        { provide: DateAdapter, useClass: MomentDateAdapter },
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: 'YYYY-MM-DD',
                },
                display: {
                    dateInput: 'YYYY-MM-DD',
                    monthYearLabel: 'YYYY MMM',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'YYYY MMM',
                },
            },
        },
        importProvidersFrom(
            FeatherModule.pick(allIcons),
            provideFirebaseApp(() => initializeApp({
                apiKey: "AIzaSyAJ4F2B6H5vvGSdLC9Vp8_KONxQVusVllo",
                authDomain: "dmf-sundargarh.firebaseapp.com",
                projectId: "dmf-sundargarh",
                storageBucket: "dmf-sundargarh.appspot.com",
                messagingSenderId: "911525505299",
                appId: "1:911525505299:web:543f554e7b30332f2ad2e6",
                measurementId: "G-PX2CM5R5CZ"
            })),
            provideAuth(() => getAuth())
        )
    ],
};

