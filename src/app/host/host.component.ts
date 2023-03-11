import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { PeerService } from '../services/peer.service';

@Component({
    selector: 'app-host',
    templateUrl: './host.component.html',
    styleUrls: ['./host.component.scss'],
})
export class HostComponent extends BaseComponent implements OnInit {
    public userName = '';
    public partnerName = '';
    public messageValue = '';

    public connected = false;
    public peerConnected = false;

    constructor(private peerService: PeerService) {
        super();
    }
    ngOnInit(): void {
        this.peerService.dataChannelConnected.subscribe((connected: boolean) => (this.connected = connected));
        this.peerService.peerConnected.subscribe((peerConnected: boolean) => (this.peerConnected = peerConnected));
        this.peerService.onMessage.subscribe((message: any) => console.log('Got message:', message));
    }

    public login(name: string): void {
        this.peerService.login(name);
    }

    public connect(name: string): void {
        this.peerService.connect(name);
    }

    public sendMessage(name: string): void {
        this.peerService.sendMessage(name);
    }
}
