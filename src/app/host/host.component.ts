import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';
import { BaseComponent } from '../base/base.component';
import { PeerService } from '../services/peer.service';

export class RequiredErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}

@Component({
    selector: 'app-host',
    templateUrl: './host.component.html',
    styleUrls: ['./host.component.scss'],
})
export class HostComponent extends BaseComponent implements OnInit {
    private loading$ = new BehaviorSubject<boolean>(false);
    public loading = this.loading$.asObservable();

    public userNameFormControl = new FormControl('', [Validators.required]);
    public matcher = new RequiredErrorStateMatcher();

    public userName = '';
    public partnerName = '';
    public messageValue = '';

    public connected = false;
    public peerConnected = false;

    constructor(private peerService: PeerService) {
        super();
    }
    ngOnInit(): void {
        this.peerService.dataChannelConnected.subscribe((connected: boolean) => {
            this.connected = connected;
            this.loading$.next(false);
        });
        this.peerService.peerConnected.subscribe((peerConnected: boolean) => {
            this.peerConnected = peerConnected;
            this.loading$.next(false);
        });
        this.peerService.onMessage.subscribe((message: any) => console.log('Got message:', message));
    }

    public login(name: string | null): void {
        if (name === null || name === '') {
            throw new Error('Cannot login with empty name');
        }

        this.userNameFormControl.markAsDirty();
        this.loading$.next(true);
        this.peerService.login(name);
    }

    public connect(name: string): void {
        this.loading$.next(true);
        this.peerService.connect(name);
    }

    public sendMessage(name: string): void {
        this.peerService.sendMessage(name);
    }
}
