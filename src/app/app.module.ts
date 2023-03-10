import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ErrorComponent } from './error/error.component';
import { HostComponent } from './host/host.component';
import { ClientComponent } from './client/client.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [AppComponent, HomeComponent, ErrorComponent, HostComponent, ClientComponent],
    imports: [BrowserModule, AppRoutingModule, RouterModule, FormsModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
