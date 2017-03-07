import { Controller, History } from 'cx/ui';

import { loadReport, addReport, saveReport, auth, addStar, removeStar, isStarred } from 'api';

import uid from 'uid';

export default class extends Controller {
    onInit() {
        this.loadReport();
    }

    loadReport() {
        let id = this.store.get('$route.id');
        if (id != 'new') {
            if (!this.store.get('$page.report'))
                this.store.set('$page.status', 'loading');

            loadReport(id)
                .then(def => {
                    this.store.set('$page.report', def);
                    this.store.delete('$page.status');
                    this.setupAutoSave();
                });

            if (auth.currentUser) {
                isStarred(id)
                    .then(value => this.store.set('$page.starred', value));
            }
        }
        else {
            this.store.init('$page.report', {
                title: 'New Report',
                sections: [],
                public: true, //for now
                userId: auth.currentUser ? auth.currentUser.uid : null
            });
        }
    }

    setupAutoSave() {
        this.addTrigger('autoSave', ['$page.report'], report => {
            if (report.autoSave) {
                console.log('autosave');
                this.saveReport();
            }
        });
    }

    saveReport() {
        let report = this.store.get('$page.report');
        let id = this.store.get('$route.id');

        if (id == 'new') {
            addReport(report)
                .then(rep => {
                    History.replaceState({}, null, `~/${rep.id}`);
                });
        }
        else {
            saveReport(id, report);
        }
    }

    starReport() {
        let id = this.store.get('$route.id');
        addStar(id)
            .then(() => {
                this.store.set('$page.starred', true);
            })
    }

    unstarReport() {
        let id = this.store.get('$route.id');
        removeStar(id)
            .then(() => {
                this.store.set('$page.starred', false);
            })
    }

    addMap(e) {
        this.addSection(e, {
            type: 'map'
        });
    }

    addLineGraph(e) {
        let defaults = this.store.get('$page.report.defaults') || {};

        this.addSection(e, {
            type: 'line-chart',
            topic: defaults.topic,
            indicator: defaults.indicator,
            fromYear: defaults.fromYear,
            toYear: defaults.toYear,
            countries: defaults.countries
        });
    }

    addColumnGraph(e) {
        this.addSection(e, {
            type: 'column-chart'
        });
    }

    addBarGraph(e) {
        let defaults = this.store.get('$page.report.defaults') || {};

        this.addSection(e, {
            type: 'bar-chart',
            topic: defaults.topic,
            indicator: defaults.indicator,
        });
    }

    addTable(e) {
        this.addSection(e, {
            type: 'table'
        });
    }

    addSection(e, section) {
        e.preventDefault();
        document.activeElement.blur();

        let data = {
            title: 'New Section',
            id: uid()
        };

        for (var key in section)
            if (typeof section[key] != 'undefined')
                data[key] = section[key];

        this.store.update('$page.report.sections', sections => [...sections, data]);

        //open in edit mode
        this.store.update('$page.sections', sections => ({
            ...sections,
            [data.id]: {form: data}
        }));
    }
}