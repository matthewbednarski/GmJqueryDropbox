/**
 * Created by matthew on 1/22/17.
 */
"use strict";
(function(_, $) {
    describe("$.dropbox Token test suite",
        function() {
            var data;

            beforeAll(function(done) {
                data = {
                    token: makeid()
                };
                $.dropbox.setToken(data.token);
                done(data);
            });

            afterAll(function() {
                data = undefined;
            });


            it("$.dropbox.hasToken():", function(done) {
                expect($.dropbox.hasToken()).toBeTruthy();
                done();
            });
            it("$.dropbox.setToken():", function(done) {
                expect($.dropbox.hasToken()).toBeTruthy();
                $.dropbox.setToken(undefined);
                expect($.dropbox.hasToken()).not.toBeTruthy();
                done();
            });
        });
    describe("$.dropbox.basic test suite",
        function() {
            var data;

            beforeAll(function(done) {
                data = {
                    token: dropbox_token
                };
                $.dropbox.setToken(data.token);
                done(data);
            });

            afterAll(function() {
                data = undefined;
            });


            it("$.dropbox.basic.files(): Should not contain a random generated file path", function(done) {
                var toFind = '/8ww3q2sn.pdf';
                $.dropbox.basic.files()
                    .then(function(files) {
                        var entry = _.chain(files.entries)
                            .map(function(content) {
                                content.path = content.path_lower;
                                return content;
                            })
                            .filter(function(file) {
                                return file.path === makeid();

                            })
                            .value();
                        expect(entry).not.toBe(undefined);
                        expect(entry.length).not.toBe(undefined);
                        expect(entry.length).toBe(0);
                        if (!entry || entry.length > 0) {
                            done.fail("File : '" + entry.path + "' should not exist.");
                        }
                        done("No file: '" + entry.path + "'");
                    });
            });
            it("$.dropbox.basic.files(): Should contain /8ww3q2sn.pdf ", function(done) {
                var toFind = '/8ww3q2sn.pdf';
                $.dropbox.basic.files()
                    .then(function(files) {
                        var entry = _.chain(files.entries)
                            .map(function(content) {
                                content.path = content.path_lower;
                                return content;
                            })
                            .filter(function(file) {
                                return file.path === '/8ww3q2sn.pdf';

                            })
                            .value();
                        expect(entry).not.toBe(undefined);
                        expect(entry.length).not.toBe(undefined);
                        expect(entry.length).toBe(1);
                        if (!entry || entry.length < 1) {
                            done.fail("Missing file: '/8ww3q2sn.pdf'");
                        }
                        done("Found file: '/8ww3q2sn.pdf'");
                    });
            });


            it("$.dropbox.getFile(): Download a binary file", function(done) {
                expect($.dropbox.hasToken()).not.toBeTruthy();
                done();
            });
            it("$.dropbox.getFileText(): Download a text file", function(done) {
                expect($.dropbox.hasToken()).not.toBeTruthy();
                done();
            });
            it("$.dropbox.addFileText(): Add a text file", function(done) {
                expect($.dropbox.hasToken()).not.toBeTruthy();
                done();
            });
            it("$.dropbox.addFile(): Add a binary file", function(done) {
                expect($.dropbox.hasToken()).not.toBeTruthy();
                done();
            });

        });
    describe("$.dropbox.fileOps test suite",
        function() {
            var data;
            var toAdd = 'test-move-' + makeid();
            var toMove = 'test-moved-' + makeid();
            var toCopy = 'test-copy-' + makeid();
            var directoryToCreate = 'test-directory-' + makeid();

            beforeAll(function(done) {
                data = {
                    token: dropbox_token
                };
                $.dropbox.setToken(data.token);
                done(data);
            });

            afterAll(function() {
                data = undefined;
            });


            it("$.dropbox.fileOps.move(): ", function(done) {
                $.dropbox.basic.addFileText(toAdd, toAdd)
                    .then(function(fileAdded) {
                        //console.dir(fileAdded);
                        $.dropbox.fileOps.move(toAdd, toMove)
                            .then(function(file) {
                                //console.dir(file);
                                expect(file).not.toBe(undefined);
                                expect(file.name).not.toBe(undefined);
                                expect(file.name).toBe(toMove);
                                done();
                            }).fail(function(err) {
                                done.fail("Could not move file: " + toAdd + ' to: ' + toMove, err);
                            });
                    }).fail(function(err) {
                        done.fail("Could not add file: " + toAdd, err);
                    });
            });
            it("$.dropbox.fileOps.copy(): ", function(done) {
                $.dropbox.fileOps.copy(toMove, toCopy)
                    .then(function(file) {
                        //console.dir(file);
                        expect(file).not.toBe(undefined);
                        expect(file.name).not.toBe(undefined);
                        expect(file.name).toBe(toCopy);
                        done();
                    }).fail(function(err) {
                        done.fail("Could not copy file: " + toMove + ' to: ' + toCopy, err);
                    });
            });
            it("$.dropbox.fileOps.remove(): ", function(done) {
                $.dropbox.fileOps.remove(toMove)
                    .then(function(file) {
                        //console.dir(file);
                        expect(file).not.toBe(undefined);
                        expect(file.name).not.toBe(undefined);
                        expect(file.name).toBe(toMove);
                        $.dropbox.fileOps.remove(toCopy)
                            .then(function(file) {
                                //console.dir(file);
                                expect(file).not.toBe(undefined);
                                expect(file.name).not.toBe(undefined);
                                expect(file.name).toBe(toCopy);
                                done();
                            }).fail(function(err) {
                                done.fail("Could not remove file: " + toCopy, err);
                            });
                    }).fail(function(err) {
                        done.fail("Could not remove file: " + toMove, err);
                    });
            });
            it("$.dropbox.fileOps.createFolder(): ", function(done) {
                $.dropbox.fileOps.createFolder(directoryToCreate)
                    .then(function(file) {
                        // console.dir(file);
                        expect(file).not.toBe(undefined);
                        expect(file.name).not.toBe(undefined);
                        expect(file.name).toBe(directoryToCreate);
                        $.dropbox.fileOps.remove(directoryToCreate)
                            .then(function(file) {
                                // console.dir(file);
                                expect(file).not.toBe(undefined);
                                expect(file.name).not.toBe(undefined);
                                expect(file['.tag']).toBe('folder');
                                expect(file.name).toBe(directoryToCreate);
                                done();
                            });
                    });
            });

        });
})(_, $);

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

