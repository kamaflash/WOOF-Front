import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender
  },

  // dinámicas → SSR puro
  {
    path: 'details/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin-animals/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'forms/:id',
    renderMode: RenderMode.Server
  }
];
