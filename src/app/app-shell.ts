import { Component } from '@angular/core';
import { HomeIntro } from './screens/home-intro/home-intro';

@Component({
  selector: 'app-shell',
  imports: [HomeIntro],
  template: `
    <div class="app-container">
      <app-home-intro />
    </div>
  `,
  styles: [`
    .app-container { width: 100%; height: 100%; overflow: hidden; position: relative; }
  `],
})
export class AppShell {}
