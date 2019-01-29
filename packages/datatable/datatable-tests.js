// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by datatable.js.
import { name as packageName } from "meteor/maclotsen:datatable";

// Write your tests here!
// Here is an example.
Tinytest.add('datatable - example', function (test) {
  test.equal(packageName, "datatable");
});
