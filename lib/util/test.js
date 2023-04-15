"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testImplementation = void 0;
const index_1 = require("../index");
const mutt_1 = require("./mutt");
const testImplementation = (implementation, { signal, computed, effect }) => {
    (0, mutt_1.test)(`(sz) ${implementation} signal implementation`, (t) => {
        // console.log('Testing', implementation, 'signal:', signal, 'computed:', computed, 'effect:', effect)
        console.log('Testing', implementation);
        const count = signal(0);
        // test count.subscribe
        const logCount = t.spy((value) => console.debug('Count:', value));
        let stop = count.subscribe(logCount);
        count.set(1);
        count.set(2);
        count.set(3);
        t.is(count(), 3, 'Signal should return current value');
        stop();
        count.set(0);
        t.is(logCount.called.length, 4, 'Subscribe should allow unsubscribing');
        // test computed
        const double = computed(() => count() * 2);
        t.is(double(), 0, 'Computed should return initial value');
        count.set(1);
        t.is(double(), 2, 'Computed should update when signal changes (1/3)');
        count.set(2);
        t.is(double(), 4, 'Computed should update when signal changes (2/3)');
        t.is(logCount.called.length, 4, 'Old subscriptions should not be called'); // should not have been called again
        // test update function
        (0, index_1.update)(count, (prev) => prev + 1);
        t.is(count(), 3, 'Updater helper should update signal');
        t.is(double(), 6, 'Computed should update when signal changes (3/3)');
        // test effect
        const logChange = t.spy(() => console.debug('Count value:', count()));
        const dispose = effect(() => {
            console.debug(' - Count value (raw):', count());
            console.debug(' - Double value (raw):', double());
            logChange();
        }); //() => console.log('Count value:', count())
        // (should get an initial call)
        t.is(logChange.called.length, 1, 'Effect should run immediately');
        (0, index_1.update)(count, (prev) => prev + 1);
        t.is(logChange.called.length, 2, 'Effect should be called after update (1/2)');
        (0, index_1.update)(count, (prev) => prev + 1);
        t.is(logChange.called.length, 3, 'Effect should be called after update (2/2)');
        (0, index_1.update)(count, (prev) => prev + 1);
        dispose(); // This will stop the effect from running
        // (should not get called again)
        (0, index_1.update)(count, (prev) => prev + 1);
        (0, index_1.update)(count, (prev) => prev + 1);
        t.is(count(), 8, 'Signal should have correct value');
        t.is(logChange.called.length, 4, 'Effect should not run after being disposed');
    });
};
exports.testImplementation = testImplementation;
