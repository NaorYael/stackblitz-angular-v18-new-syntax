import { Component, OnInit, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ApiService, Post, User } from './api.service';
import { provideHttpClient } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
  @if (users.length > 0) { 
  <h2 class="title">User List</h2>
  <ul class="user-list">
    @for (user of users; track user.name) {
      <li class="user-item" (click)=getPostsByUserId(user.id) [title]=user.name>{{ user.name }}</li>
      } @empty {
      <li class="no-users-message">There are no users.</li>
      }
  </ul>
  }
  `,
})
export class App implements OnInit {
  private _dataService = inject(ApiService);
  private _posts: Post[] = [];
  public users: User[] = [];

  ngOnInit(): void {
    this._dataService
      .getUsers$()
      .pipe(
        switchMap((users) => {
          this.users = users;
          return this._dataService.getPosts$();
        }),
        catchError((err) => {
          console.error('Error fetching data:', err);
          return of([]);
        })
      )
      .subscribe({
        next: (posts) => (this._posts = posts),
        error: (err) => console.error('Error fetching posts:', err),
      });
  }

  public getPostsByUserId(userId: number | undefined) {
    if (!userId) return;

    const userPosts = this._posts.filter((post) => post.userId === userId);
    alert(JSON.stringify(userPosts));
  }
}

bootstrapApplication(App, {
  providers: [provideHttpClient(), ApiService],
});
