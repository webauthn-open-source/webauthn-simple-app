/* globals chai, assert, fido2Helpers, GlobalWebAuthnClasses */

describe("Msg", function() {
    const { Msg } = GlobalWebAuthnClasses;

    class TestClass extends Msg {
        constructor() {
            super();

            this.propList = ["username", "displayName"];
        }
    }

    describe("from", function() {

        it("accepts object", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            assert.instanceOf(msg, Msg);
            assert.strictEqual(msg.username, "adam");
            assert.strictEqual(msg.displayName, "Adam Powers");
        });

        it("accepts string", function() {
            var json = JSON.stringify({
                username: "adam",
                displayName: "Adam Powers"
            });

            var msg = TestClass.from(json);
            assert.instanceOf(msg, Msg);
            assert.strictEqual(msg.username, "adam");
            assert.strictEqual(msg.displayName, "Adam Powers");
        });

        it("throws on no arguments", function() {
            assert.throws(() => {
                TestClass.from();
            }, TypeError, "could not coerce 'json' argument to an object");
        });

        it("throws on bad string", function() {
            assert.throws(() => {
                TestClass.from("this is a bad string");
            }, TypeError, "error parsing JSON string");
        });

        it("accepts empty object", function() {
            var msg = TestClass.from({});
            msg.propList = ["username", "displayName"];

            assert.instanceOf(msg, Msg);
            assert.isUndefined(msg.username);
            assert.isUndefined(msg.displayName);
        });
    });

    describe("toObject", function() {
        it("converts to object", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            var obj = msg.toObject();
            assert.notInstanceOf(obj, Msg);
            assert.strictEqual(obj.username, "adam");
            assert.strictEqual(obj.displayName, "Adam Powers");
        });
    });

    describe("toString", function() {
        it("converts object to string", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            var str = msg.toString();
            assert.isString(str);
            assert.strictEqual(str, "{\"username\":\"adam\",\"displayName\":\"Adam Powers\"}");
        });
    });

    describe("toHumanString", function() {
        it("converts object to string", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            var str = msg.toHumanString();
            assert.isString(str);
            assert.strictEqual(str, "[TestClass] {\n    username: \"adam\",\n    displayName: \"Adam Powers\",\n}");
        });
    });

    describe("static toHumanString", function() {
        it("converts object to string", function() {
            var str = TestClass.toHumanString({
                username: "adam",
                displayName: "Adam Powers"
            });

            assert.isString(str);
            assert.strictEqual(str, "[TestClass] {\n    username: \"adam\",\n    displayName: \"Adam Powers\",\n}");
        });
    });

    describe("toHumanHtml", function() {
        it("converts object to string", function() {
            var msg = TestClass.from({
                username: "adam",
                displayName: "Adam Powers"
            });

            var str = msg.toHumanHtml();
            assert.isString(str);
            assert.strictEqual(str, "[TestClass]&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;username:&nbsp;\"adam\",<br>&nbsp;&nbsp;&nbsp;&nbsp;displayName:&nbsp;\"Adam&nbsp;Powers\",<br>}");
        });
    });
});
