import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
    @Input() loading: Observable<boolean> = new Observable<boolean>();
    @Input() text: string = '';

    constructor() {}

    ngOnInit(): void {}
}
