import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';

// ✅ Prevent scroll from changing number inputs globally
document.addEventListener('wheel', (e) => {
  if ((e.target as HTMLElement).getAttribute('type') === 'number') {
    e.preventDefault();
  }
}, { passive: false });

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
