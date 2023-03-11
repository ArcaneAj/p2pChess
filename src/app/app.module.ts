import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ErrorComponent } from './error/error.component';
import { HostComponent } from './host/host.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PeerService } from './services/peer.service';
import { BaseComponent } from './base/base.component';

@NgModule({
    declarations: [AppComponent, HomeComponent, ErrorComponent, HostComponent, BaseComponent],
    imports: [BrowserModule, AppRoutingModule, RouterModule, FormsModule],
    providers: [PeerService],
    bootstrap: [AppComponent],
})
export class AppModule {}
