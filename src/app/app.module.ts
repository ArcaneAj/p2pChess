import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

// Services
import { PeerService } from './services/peer.service';

// Components
import { AppComponent } from './app.component';
import { BaseComponent } from './base/base.component';
import { ErrorComponent } from './error/error.component';
import { HomeComponent } from './home/home.component';
import { HostComponent } from './host/host.component';
import { LoadingComponent } from './loading/loading.component';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    declarations: [AppComponent, BaseComponent, ErrorComponent, HomeComponent, HostComponent, LoadingComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        // Angular Material
        MatButtonModule,
        MatCardModule,
        MatInputModule,
        MatProgressSpinnerModule,
    ],
    providers: [PeerService],
    bootstrap: [AppComponent],
})
export class AppModule {}
