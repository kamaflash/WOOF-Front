export function getPrerenderParams(route: string) {
  switch (route) {
    case 'details/:id':
      return [
        { id: '1' },
        { id: '2' },
        { id: '3' }
      ];
    case 'admin-animals/:id':
      return [
        { id: 'a1' },
        { id: 'a2' }
      ];
    case 'forms/:id':
      return [
        { id: 'f1' },
        { id: 'f2' }
      ];
    default:
      return [{}];
  }
}
