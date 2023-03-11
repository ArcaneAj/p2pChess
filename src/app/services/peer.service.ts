import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PeerService {
    private signalingServer = new WebSocket('ws://localhost:9090');
    private connectedUser = '';
    private peerFound = false;
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
            var data = JSON.parse(message.data);
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
        this.signalingServer.onopen = (ev: Event) => {
            console.log('Connection Opened');
        };
        this.signalingServer.onclose = (ev: Event) => {
            console.error('Connection Lost');
        };
        this.signalingServer.onerror = (error) => {
            console.error(error);
        };
    }

    public sendMessage(message: string): void {
        if (!this.dataChannel) {
            throw new Error('dataChannel was not set');
        }
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
        this.connectedUser = name;
        if (name.length > 0 && this.myConnection) {
            //make an offer
            this.myConnection.createOffer().then(
                (offer: RTCSessionDescriptionInit) => {
                    if (!this.myConnection) {
                        throw new Error('myConnection was not set');
                    }
                    this.peerFound = false;
                    this.send({
                        type: 'offer',
                        offer: offer,
                    });
                    setTimeout(() => {
                        if (!this.peerFound) {
                            alert('Could not connect to that user, please try again later');
                            return;
                        }
                    }, 5000);
                    this.myConnection.setLocalDescription(offer);
                },
                (error) => {
                    console.error(error);
                }
            );
        }
    }

    private onLogin(success: boolean): void {
        if (!success) {
            alert('Username already in use, please try again');
            this.dataChannelConnectedSubject.next(false);
            return;
        }
        //creating our RTCPeerConnection object
        var configuration: RTCConfiguration = {
            iceServers: [{ urls: 'stun:stun.1.google.com:19302' }],
        };

        this.myConnection = new RTCPeerConnection(configuration);

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
            (error) => {
                console.error(error);
            }
        );
    }

    private onAnswer(answer: RTCSessionDescriptionInit) {
        if (!this.myConnection) {
            throw new Error('myConnection was not set');
        }
        this.myConnection.setRemoteDescription(new RTCSessionDescription(answer));
        this.peerFound = true;
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

        var dataChannelOptions: RTCDataChannelInit = {
            negotiated: true,
            id: 0,
        };

        this.dataChannel = this.myConnection.createDataChannel('myDataChannel', dataChannelOptions);

        this.dataChannel.onerror = (error: Event) => {
            console.error(error);
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
