import {Meteor} from 'meteor/meteor';
import {Blaze} from "meteor/blaze";
import {Template} from "meteor/templating";
import {Session} from "meteor/session";

import './datatable.less';
import './datatable.html';

(function () {

    const defaultOptions = {
        title: false,
        entity: null,
        footer: false,
        paging: {
            index: 0,
            selected: 5,
            options: [5, 10, 25],
            buttons: 5
        },
        query: {},
        editable: false
    };

    Template.datatable.onCreated(function () {
        let self = this;
        const keys = this.data ? Object.keys(this.data) : [];
        for (const key in defaultOptions) {
            let found = false;
            for (const key2 in keys) {
                if (key === keys[key2]) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.data[key] = defaultOptions[key]
            }
        }
        Session.setDefault(self.data.id, {
            limit: self.data.paging.selected,
            skip: self.data.paging.index,
            query: self.data.query,
            sort: {}
        });
        for (const i in self.data.subscriptions) {
            this.autorun(function () {
                return self.data.subscriptions[i](Session.get(self.data.id).skip, Session.get(self.data.id).limit);
            });
        }
    });

    Template.datatable.helpers({
        notReady() {
            return !Template.instance().subscriptionsReady();
        },
        dummyRows() {
            const sess = Session.get(this.id);
            const arr = [];
            const entityCount = this.entity.find(sess.query, {
                skip: sess.skip,
                limit: sess.limit,
            }).count();
            for (let i = 0; i < sess.limit - entityCount; i++) {
                arr.push(1);
            }
            return arr;
        },
        selectedOption(n, id) {
            return parseInt(n) === Session.get(id).limit ? 'active' : '';
        },
        pageLimit() {
            return Session.get(this.id).limit;
        },
        count() {
            return this.entity.find(Session.get(this.id).query).count();
        },
        pageCount() {
            return Math.ceil(this.entity.find(Session.get(this.id).query).count() / Session.get(this.id).limit);
        },
        showPageCount() {
            return Math.ceil(this.entity.find(Session.get(this.id).query).count() / Session.get(this.id).limit) > 1;
        },
        pageSelected() {
            return Math.ceil(Session.get(this.id).skip / Session.get(this.id).limit) + 1;
        },
        pagesBetween(buttons) {
            const sess = Session.get(this.id);
            const selected = Math.floor(sess.skip / sess.limit);
            const maxPage = Math.ceil(this.entity.find(sess.query).count() / sess.limit);
            let start = Math.max(selected - Math.floor(buttons / 2) + 1, 2);
            const pages = [];
            for (let i = 0; i < buttons; i++) {
                if (start + i < 2)
                    continue;
                if (start + i >= maxPage)
                    break;
                pages.push(start + i);
            }
            return pages;
        },
        pagePrevious() {
            return Math.ceil(Session.get(this.id).skip / Session.get(this.id).limit);
        },
        pageHasPrevious() {
            return Session.get(this.id).skip === 0 ? 'disabled' : '';
        },
        pageNext() {
            return Math.ceil(Session.get(this.id).skip / Session.get(this.id).limit) + 2;
        },
        pageHasNext() {
            const sess = Session.get(this.id);
            return sess.skip + sess.limit
            >= this.entity.find(sess.query).count()
                ? 'disabled' : '';
        },
        pageActive(n) {
            const sess = Session.get(Template.instance().data.id);
            return n - 1 === Math.ceil(sess.skip / sess.limit) ? 'active' : '';
        },
        entities() {
            try {
                const {skip, limit, sort, query} = Session.get(this.id);
                const q = {skip, limit};
                if (sort)
                    q['sort'] = sort;
                return this.entity.find(query, q);
            } catch (err) {
                console.error(err.message);
            }
        },
        sortIcon() {
            const sess = Session.get(Template.instance().data.id);
            if (sess.sort && sess.sort[this.$query]) {
                switch (sess.sort[this.$query]) {
                    case 1:
                        return 'fa-caret-up';
                    case -1:
                        return 'fa-caret-down';
                }
            }
            return 'fa-caret-left';//'fa-sort-desc';
        },
        hasEdit() {
            for (const i in this.columns) {
                if (this.columns[i].editable) {
                    return true;
                }
            }
            return false;
        }
    });

    Template.datatable.events({
        'click ul.dropdown-menu.paging li:not(.disabled) a'(e) {
            e.preventDefault();
            const val = parseInt(e.currentTarget.attributes['data-target-id'].value);
            const sess = Session.get(Template.instance().data.id);
            sess.limit = val;
            Session.set(Template.instance().data.id, sess);
        },
        'click ul.pagination li:not(.disabled) a'(e) {
            e.preventDefault();
            const page = parseInt(e.currentTarget.attributes['data-target-id'].value);
            const sess = Session.get(Template.instance().data.id);
            sess.skip = (page - 1) * Session.get(Template.instance().data.id).limit;
            Session.set(Template.instance().data.id, sess);
        },
        'input input.search'(e) {
            e.preventDefault();
            if (e.target.value && e.target.value.length >= 1) {
                const query = Session.get(this.id).query;
                query.$or = this.query.$or || [];
                const textQueries = e.target.value.split(' ');
                for (const i in this.fields) {
                    const $and = [];
                    for (const j in textQueries) {
                        const fieldQ = {};
                        fieldQ[this.fields[i]] = {$regex: `.*${textQueries[j]}.*`, $options: 'i'};
                        $and.push(fieldQ);
                    }
                    query.$or.push({$and});
                }
                const sess = Session.get(this.id);
                sess.query = query;
                Session.set(this.id, sess);
            } else {
                const sess = Session.get(this.id);
                sess.query = this.query;
                Session.set(this.id, sess);
            }
        },
        'submit form.datatable'(e) {
            e.preventDefault();
        },
        'click div.sorting'(e) {
            const sess = Session.get(Template.instance().data.id);
            sess.sort = sess.sort || {};
            if (sess.sort[this.$query]) {
                switch (sess.sort[this.$query]) {
                    case 1:
                        sess.sort[this.$query] = -1;
                        break;
                    case -1:
                        delete sess.sort[this.$query];
                        break;
                }
            } else {
                sess.sort[this.$query] = 1;
            }
            Session.set(Template.instance().data.id, sess);
        },
        'click .btn-custom'(e) {
            if (this.onclick) {
                this.onclick(Template.instance(), e);
            }
        }
    });

    Template.entityRows.onCreated(function () {
        Session.setDefault(this.data.object._id, {edit: false});
    });

    Template.entityRows.onRendered(function () {
        // column.attr('width', ((instance.data.actions.length + (Session.get(this.object._id).edit ? 2: 1)) * 30) + 'px');
        const btnGroup = this.$('td:last-child .btn-group');
        const column = btnGroup.closest('td');
        column.attr('width', ((this.data.actions.length + (Session.get(this.data.object._id).edit ? 2: 1)) * 40) + 'px');
    });

    Template.entityRows.helpers({
        data(object) {
            return this.propertySelector(object);
        },
        hasButtons() {
            for (const i in this.columns) {
                if (this.columns[i].editable) {
                    return true;
                }
            }
            return !this.actions ? false : !!this.actions + Session.get(Template.instance().data.object._id).edit;
        },
        hasEditables() {
            for (const i in this.columns) {
                if (this.columns[i].editable) {
                    return true;
                }
            }
            return false;
        },
        hasEdit() {
            if (Session.get(this.object._id) && Session.get(this.object._id).edit)
                return false;
            for (const i in this.columns) {
                if (this.columns[i].editable) {
                    return true;
                }
            }
            return false;
        },
        hasSubmit() {
            return Session.get(Template.instance().data.object._id).edit;
        },
        editMode() {
            return Session.get(Template.instance().data.object._id).edit && this.editable;
        },
        syncMode() {
            return this.sync;
        }
    });

    Template.entityRows.events({
        'click tr td button.item-btn'(e) {
            if (this.onclick) {
                this.onclick(Template.instance().data.object, e)
            }
        },
        'click tr td button.item-edit'(e) {
            const sess = Session.get(this.object._id);
            sess.edit = !sess.edit;
            Session.set(this.object._id, sess);

            const instance = Template.instance();
            const btnGroup = $(instance.find('td:last-child .btn-group'));
            const column = btnGroup.closest('td');
            column.attr('width', ((instance.data.actions.length + (Session.get(this.object._id).edit ? 2: 1)) * 40) + 'px');
        },
        'click tr td button.item-cancel'(e) {
            const sess = Session.get(this.object._id);
            sess.edit = false;
            Session.set(this.object._id, sess);

            const instance = Template.instance();
            const btnGroup = $(instance.find('td:last-child .btn-group'));
            const column = btnGroup.closest('td');
            column.attr('width', ((instance.data.actions.length + (Session.get(this.object._id).edit ? 2: 1)) * 40) + 'px');
        },
        'click tr td button.item-save'(e) {
            const {object, entity} = Template.instance().data;
            const payload = {};
            Template.instance().$('input.edit')
                .each(function (key, value) {
                    payload[value.name] = value.type === 'number' ? value.valueAsNumber : value.value;
                });
            entity.update({_id: object._id}, {$set: payload}, function (err, data) {
                if (err) {
                    alert(err.message);
                    return err;
                }
            });
            const sess = Session.get(this.object._id);
            sess.edit = false;
            Session.set(this.object._id, sess);
        },
        'change input.sync'(e) {
            e.preventDefault();
            const {object, entity} = Template.instance().data;
            const $set = {};
            $set[this.$query] = e.target.value;
            entity.update({_id: object._id}, {$set}, function (err, data) {
                if (err) {
                    alert(err.message);
                    return err;
                }
            });
        }
    });

})();
