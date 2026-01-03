import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

export default function bootstrap(context: unknown) {
  return bootstrapApplication(AppComponent, {
    providers: [
      provideServerRendering(),
      ...appConfig.providers,
      provideClientHydration()
    ],
  }, context as any); // 👈 casteo para evitar el error
}
