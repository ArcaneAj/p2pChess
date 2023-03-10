import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-client',
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.scss'],
})
export class ClientComponent implements OnInit {
    public id = '';

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        const routeParams = this.route.snapshot.paramMap;
        const idParam = routeParams.get('id');
        if (idParam != null) {
            this.id = idParam;
        }
    }
}
