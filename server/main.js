import {Meteor} from 'meteor/meteor';
import {HTTP} from 'meteor/http';

(function () {
    Meteor.publish('users', function (skip, limit) {
        return Meteor.users.find({}, {
            skip, limit
        });
    });


    const ages = [18, 24, 26, 32, 46, 64, 54, 53, 43, 23, 21, 27];
    Meteor.startup(() => {

        // code to run on server at startup
        if (Meteor.users.find({}).count() < 10) {

            Accounts.createUser({
                email: "john@doe.nl",
                password: 'hello123',
                profile: {
                    fullname: "John Doe",
                    email: "john@doe.nl",
                    age: 543
                }
            });

            HTTP.call('get', 'https://raw.githubusercontent.com/dominictarr/random-name/master/first-names.json', function (err, data) {
                console.log(err, data);
                if (data.statusCode === 200) {
                    const names = [ ... new Set(JSON.parse(data.content))];

                    for (const i in names)
                        Meteor.users.insert({
                            profile: {
                                fullname: names[i],
                                email: names[i].toLocaleLowerCase() + '@example.com',
                                age: ages[Math.floor(Math.random() * ages.length)]
                            },
                            emails: [{address: names[i].toLocaleLowerCase() + '@example.com'}]
                        });
                }
            });
        }
    });

})();
