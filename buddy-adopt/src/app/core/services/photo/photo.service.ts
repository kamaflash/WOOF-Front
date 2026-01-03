import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  getImages(): Promise<any[]> {
    return Promise.resolve([
      {
        itemImageSrc: 'https://picsum.photos/id/1018/1000/600/',
        thumbnailImageSrc: 'https://picsum.photos/id/1018/250/150/',
        alt: 'Nature 1',
        title: 'Majestic Mountains'
      },
      {
        itemImageSrc: 'https://picsum.photos/id/1024/1000/600/',
        thumbnailImageSrc: 'https://picsum.photos/id/1024/250/150/',
        alt: 'Nature 2',
        title: 'Ocean Breeze'
      },
      {
        itemImageSrc: 'https://picsum.photos/id/1035/1000/600/',
        thumbnailImageSrc: 'https://picsum.photos/id/1035/250/150/',
        alt: 'Nature 3',
        title: 'Golden Fields'
      }
    ]);
  }
}
