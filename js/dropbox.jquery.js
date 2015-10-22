/***
 * per window.jQuery
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.js" ></script>
 * o
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js" ></script>
 *
 *
 * per window.Q
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/q.js/1.4.1/q.js" ></script>
 * o
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/q.js/1.4.1/q.min.js *
 * per window._
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.js"></script>
 * o
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.min.js"></script>
 */
(function($, Q, _) {

    //window.dropbox = new Dropbox('****************', '****************');
    function DropboxAuth() {
        return {
            getAccessCode: getAccessCode,
            getAuth: getAuth
        };

        function getAccessCode(client_id) {
            var url = 'https://www.dropbox.com/1/oauth2/authorize';
            window.open(url + '/?client_id=' + client_id + '&response_type=code');
        }

        function getAuth(code, client_id, client_secret) {
            var def = Q.defer();
            var url = 'https://api.dropboxapi.com/1/oauth2/token';
            var req = $.ajax({
                type: 'POST',
                url: url,
                data: "code=" + code + '&grant_type=authorization_code&client_id=' + client_id + '&client_secret=' + client_secret,
                dataType: "json",
                beforeSend: function(request) {
                    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                }
            }).done(function(res) {
                def.resolve(res);
            }).fail(function(res) {
                console.error(res);
                def.reject(res);
            });
            return def.promise;
        }
    }

    function Dropbox(token) {

        var access_token = token;
        return {
            user: {
                userInfo: userInfo
            },
            basic: {
                getFile: getFile,
                files: listFiles,
                getFiles: listFiles,
                putFile: putFile
            },
            fileOps: {
                move: moveFile,
                copy: copyFile,
                deleteFile: deleteFile,
                remove: deleteFile,
                createFolder: createFolder
            }
        };


        function userInfo() {
            var def = Q.defer();
            var url = 'https://api.dropboxapi.com/1/account/info';
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'JSON',
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                }
            }).then(function(res) {
                def.resolve(res);
            }).fail(function(res) {
                def.reject(res);
            });

            return def.promise;
        }

        function listFiles(path) {
            var def = Q.defer();
            var url = 'https://api.dropboxapi.com/1/metadata/auto/';
            if (path !== undefined) {
                url += path;

            }
            $.ajax({
                method: 'GET',
                url: url,
                dataType: "JSON",
                data: {
                    list: true
                },
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                }
            }).then(function(res) {
                def.resolve(res);
            }).fail(function(res, a, b) {
                def.reject(res);
            });
            return def.promise;
        }

        function getFile(content) {
            var def = Q.defer();
            var url = 'https://content.dropboxapi.com/1/files/auto';
            $.ajax({
                type: 'GET',
                url: url + content.path,
                dataType: 'blob',
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                    request.setRequestHeader("Accept", content.mime_type);
                }
            }).then(function(res, a, b, c) {
                if (res !== undefined) {
                    var name = content.path.substring(1);
                    var file = new File([res], name, {
                        type: res.type
                    });
                    var url = URL.createObjectURL(file);
                    def.resolve({
                        blob: res,
                        file: file,
                        url: url
                    });
                }
            }).fail(function(res) {
                def.reject(res);
            });

            return def.promise;
        }

        function putFile(file) {
            var defer = Q.defer();
            var url = 'https://content.dropboxapi.com/1/files_put/auto/';
            var filepath = file.name;
            var filename = filepath.replace(/^.*?([^\\\/]*)$/, '$1');
            url += filename;
            var fd = new FormData();
            fd.append('file', file, filename);
            $.ajax({
                    type: 'PUT',
                    url: url,
                    data: fd,
                    dataType: 'JSON',
                    processData: false,
                    contentType: false,
                    beforeSend: function(request) {
                        request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                    }
                })
                .then(function(res) {
                    defer.resolve(res);
                })
                .fail(function(res) {
                    defer.reject(res);
                });
            return defer.promise;
        }

        function moveFile(from, to) {
        	var data = {
        		root : 'auto',
        		from_path : from,
        		to_path : to
			};
			return _operation('move', data);
        }

        function copyFile(from, to) {
        	var data = {
        		root : 'auto',
        		from_path : from,
        		to_path : to
			};
			return _operation('copy', data);
        }

        function deleteFile(filePath) {
        	var data = {
        		root : 'auto',
        		path : filePath
			};
			return _operation('delete', data);
        }

        function createFolder(folderPath) {
        	var data = {
        		root : 'auto',
        		path : filePath
			};
			return _operation('create_folder', data);
        }

        function _operation(type, data) {
            var defer = Q.defer();
            var url = 'https://api.dropboxapi.com/1/fileops/' + type;
            $.ajax({
                    type: 'POST',
                    url: url,
                    data: JSON.stringify(data),
                    dataType: 'JSON',
                    processData: false,
                    contentType: false,
                    beforeSend: function(request) {
                        request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                    }
                })
                .then(function(res) {
                    defer.resolve(res);
                })
                .fail(function(res) {
                    defer.reject(res);
                });
            return defer.promise;
        }

    }
    window.DropboxAuth = DropboxAuth;
    window.Dropbox = Dropbox;
})(window.jQuery, window.Q, window._);
