import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'NO_SELECT',
    template: '<div>DO NOT USE</div>',
})
export class BaseComponent implements OnDestroy {
    private subscription: Subscription = new Subscription();
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
