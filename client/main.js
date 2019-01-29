import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

import './main.less';
import './main.html';

(function () {

    Meteor.loginWithPassword('john@doe.nl', 'hello123', function (err) {
        if (err) {
            console.log(err);
        }
    });


    function users(skip, limit) {
        return Meteor.subscribe('users', skip, limit);
    }

    Template.main.helpers({
        entity() {
            return Meteor.users;
        },
        ignore() {
            return {'options': 'false'};
        },
        subscribe() {
            return [users];
        },
        columns() {
            return [
                {
                    title: "Name",
                    type: "text",
                    sync: true,
                    $query: 'profile.fullname',
                    propertySelector: function (entity) {
                        return entity.profile ? entity.profile.fullname : 'Unknown';
                    }
                }, {
                    title: "Email",
                    type: "email",
                    $query: 'profile.email',
                    editable: true,
                    propertySelector: function (entity) {
                        return entity.profile && entity.profile.email ? entity.profile.email : 'Unknown';
                    }
                }, {
                    title: "Age",
                    type: "number",
                    editable: true,
                    $query: 'profile.age',
                    propertySelector: function (entity) {
                        return entity.profile && entity.profile.age ? entity.profile.age : 'Unkown';
                    }
                }
            ];
        },
        fields() {
            return [
                'profile.fullname',
                'profile.email'
            ];
        },
        globalActions() {
            return [{
                onclick(e) {
                    alert("We aren't recruiting anyone today...");
                },
                icon: 'fa-plus'
            }, {
                icon: 'fa-book'
            }];
        },
        actions() {
            return [{
                onclick(object, event) {
                    if (confirm(`Are you sure to remove ${object.profile.fullname}?`)) {
                        Meteor.users.remove({_id: object._id});
                    }
                },
                icon: 'fa-trash'
            }];
        }
    });
})();
