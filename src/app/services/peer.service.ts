import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PeerService {
    private signalingServer = new WebSocket('ws://localhost:9090');
    private connectedUser = '';
    private myConnection?: RTCPeerConnection;

    private dataChannel?: RTCDataChannel;

    private dataChannelConnectedSubject: Subject<boolean> = new Subject<boolean>();
    public dataChannelConnected: Observable<boolean> = this.dataChannelConnectedSubject.asObservable();

    private peerConnectedSubject: Subject<boolean> = new Subject<boolean>();
    public peerConnected: Observable<boolean> = this.peerConnectedSubject.asObservable();

    private onMessageSubject: Subject<any> = new Subject<any>();
    public onMessage: Observable<any> = this.onMessageSubject.asObservable();

    constructor() {
        this.signalingServer.onmessage = (message: MessageEvent<any>) => {
            console.log(message);
            var data = JSON.parse(message.data);
            console.log(data);
            switch (data.type) {
                case 'login':
                    this.onLogin(data.success);
                    break;
                case 'offer':
                    this.onOffer(data.offer, data.name);
                    break;
                case 'answer':
                    this.onAnswer(data.answer);
                    break;
                case 'candidate':
                    this.onCandidate(data.candidate);
                    break;
                default:
                    break;
            }
        };
        this.signalingServer.onopen = function (ev: Event) {
            console.log('Connection Opened');
        };
        this.signalingServer.onclose = function (ev: Event) {
            console.log('Connection Lost');
        };
        this.signalingServer.onerror = function (ev: Event) {
            console.error(ev);
        };
    }

    public sendMessage(message: string): void {
        if (!this.dataChannel) {
            throw new Error('dataChannel was not set');
        }
        console.log('send message: ' + message);
        this.dataChannel.send(message);
    }

    public login(name: string): void {
        if (name.length > 0) {
            this.send({
                type: 'login',
                name: name,
            });
        }
    }

    public connect(name: string): void {
        console.log(name);
        this.connectedUser = name;
        if (name.length > 0 && this.myConnection) {
            //make an offer
            const offerOptions: RTCOfferOptions = {};
            this.myConnection.createOffer().then(
                (offer: RTCSessionDescriptionInit) => {
                    if (!this.myConnection) {
                        throw new Error('myConnection was not set');
                    }
                    this.send({
                        type: 'offer',
                        offer: offer,
                    });
                    this.myConnection.setLocalDescription(offer);
                },
                (error) => {
                    alert('An error has occurred.');
                }
            );
        }
    }

    private onLogin(success: boolean): void {
        if (!success) {
            alert('oops...try a different username');
            return;
        }
        //creating our RTCPeerConnection object
        var configuration: RTCConfiguration = {
            iceServers: [{ urls: 'stun:stun.1.google.com:19302' }],
        };

        this.myConnection = new RTCPeerConnection(configuration);

        console.log('RTCPeerConnection object was created');
        console.log(this.myConnection);

        //setup ice handling
        //when the browser finds an ice candidate we send it to another peer
        this.myConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                this.send({
                    type: 'candidate',
                    candidate: event.candidate,
                });
            }
        };

        this.openDataChannel();
    }

    private onOffer(offer: RTCSessionDescriptionInit, name: string): void {
        this.connectedUser = name;
        if (!this.myConnection) {
            throw new Error('myConnection was not set');
        }

        this.myConnection.setRemoteDescription(new RTCSessionDescription(offer));
        this.peerConnectedSubject.next(true);

        this.myConnection.createAnswer().then(
            (answer: RTCSessionDescriptionInit) => {
                if (!this.myConnection) {
                    throw new Error('myConnection was not set');
                }

                this.myConnection.setLocalDescription(answer);
                this.send({
                    type: 'answer',
                    answer: answer,
                });
            },
            function (error) {
                alert('oops...error');
            }
        );
    }

    private onAnswer(answer: RTCSessionDescriptionInit) {
        if (!this.myConnection) {
            throw new Error('myConnection was not set');
        }
        this.myConnection.setRemoteDescription(new RTCSessionDescription(answer));
        this.peerConnectedSubject.next(true);
    }

    private onCandidate(candidate: RTCIceCandidateInit) {
        if (!this.myConnection) {
            throw new Error('myConnection was not set');
        }
        this.myConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    private openDataChannel() {
        if (!this.myConnection) {
            throw new Error('myConnection was not set');
        }
        console.log('created data channel');
        var dataChannelOptions: RTCDataChannelInit = {
            negotiated: true,
            id: 0,
        };

        this.dataChannel = this.myConnection.createDataChannel('myDataChannel', dataChannelOptions);

        this.dataChannel.onerror = (error: Event): void => {
            console.log('Error:', error);
        };

        this.dataChannel.onmessage = (event: MessageEvent<any>): void => {
            this.onMessageSubject.next(event.data);
        };

        this.dataChannel.onclose = (error: Event): void => {
            this.dataChannelConnectedSubject.next(false);
        };

        this.dataChannelConnectedSubject.next(true);
    }

    private send(message: any): void {
        if (this.connectedUser) {
            message.name = this.connectedUser;
        }

        this.signalingServer.send(JSON.stringify(message));
    }
}
