/***
 *
 * Extends jQuery with dropbox crud functionality
 *
 * All API methods return a promise unless specified otherwise.
 *
 */
(function($) {
    jQuery.extend({
        dropboxAuth: new DropboxAuth(),
        dropbox: new Dropbox()
    });
/** *
     * Contains the methods necessary for obtaining a Dropbox oauth token
     *
     */
    function DropboxAuth() {
        /**
         *
         * the methods exposed by this API
         *
         */
        return {
            getAccessCode: getAccessCode,
            getAuth: getAuth
        };

        /**
         *
         * Navigates to the oauth authorize url
         *
         * @param client_id         the client_id to be used for Dropbox authentication access code retrieval
         *
         * NB does not return a promise
         *
         */
        function getAccessCode(client_id) {
            var url = 'https://www.dropbox.com/1/oauth2/authorize';
            window.open(url + '/?client_id=' + client_id + '&response_type=code');
        }

        /**
         *
         * Returns a promise containing the Dropbox API access token
         *
         * @param code              the access code to be used for Dropbox authentication token retrieval
         * @param client_id         the client_id to be used for Dropbox authentication token retrieval
         * @param client_secret     the client_secret to be used for Dropbox authentication token retrieval
         */
        function getAuth(code, client_id, client_secret) {
            var data = {
                code: code,
                grant_type: 'authorization_code',
                client_id: client_id,
                client_secret: client_secret
            };
            var url = 'https://api.dropboxapi.com/1/oauth2/token';
            return $.ajax({
                type: 'POST',
                url: url,
                data: $.param(data),
                dataType: "json",
                beforeSend: function(request) {
                    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                }
            });
        }
    }

    /**
     *
     * Gives access to the files made available by the Dropbox access token
     *
     * @param token     the string access token to be used for Dropbox authentication
     *
     */
    function Dropbox(token) {
        var access_token = token;
        /**
         *
         * the methods exposed by the API
         *
         */
        return {
            setToken: setToken,
            hasToken: hasToken,
            user: {
                userInfo: userInfo
            },
            basic: {
                getFile: getFile,
                getFileText: getFileText,
                files: listFiles,
                getFiles: listFiles,
                addFile: putFile,
                putFile: putFile,
                addFileText: putFileText,
                putFileText: putFileText
            },
            fileOps: {
                move: moveFile,
                copy: copyFile,
                deleteFile: deleteFile,
                remove: deleteFile,
                createFolder: createFolder
            }
        };


        /**
         *
         * sets the access token to be used by successive calls to the API
         *
         * @param token     the string access token to be used for Dropbox authentication
         *
         * NB does not return a promise
         *
         */
        function setToken(token) {
            access_token = token;
        }

        /**
         *
         * Returns a value indicating if the access token has been set
         *
         * NB does not return a promise
         */
        function hasToken() {
            return access_token !== undefined && access_token !== '';
        }

        /**
         *
         * Returns the user's information
         *
         */
        function userInfo() {
            var url = 'https://api.dropboxapi.com/1/account/info';
            return $.ajax({
                type: 'GET',
                url: url,
                dataType: 'JSON',
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                }
            });
        }

        /**
         *
         * Returns a promise for a list of files for a given path.
         *
         * @param path (optional) path to list contents of
         *
         */
        function listFiles(path) {
            var url = 'https://api.dropboxapi.com/1/metadata/auto/';
            if (path !== undefined) {
                url += path;
            }
            return $.ajax({
                method: 'GET',
                url: url,
                dataType: "JSON",
                data: {
                    list: true
                },
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                }
            });
        }

        /**
         *
         * Returns a promise for a binary version of the file contents if possible (ie Blob, File or ArrayBuffer)
         *
         * @param content 	          object containing info on the file to retrieve
         * @param content.path 	      path of file to retrieve
         * @param content.mime_type   mime-type of file to retrieve
         *
         */
        function getFile(content) {
            var url = 'https://content.dropboxapi.com/1/files/auto';
            return $.ajax({
                type: 'GET',
                url: url + content.path,
                dataType: 'blob',
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                    request.setRequestHeader("Accept", content.mime_type);
                }
            });
        }

        /**
         *
         * Returns a promise for the default $.ajax contents of the file
         *
         * @param content 	          object containing info on the file to retrieve
         * @param content.path 	      path of file to retrieve
         * @param content.mime_type   mime-type of file to retrieve
         *
         */
        function getFileText(content) {
            var url = 'https://content.dropboxapi.com/1/files/auto';
            return $.ajax({
                type: 'GET',
                url: url + content.path,
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                    request.setRequestHeader("Accept", content.mime_type);
                }
            });
        }

        /**
         *
         * Adds a file to Dropbox
         *
         * @param file    the File to add
         *
         */
        function putFile(file) {
            var url = 'https://content.dropboxapi.com/1/files_put/auto/';
            var filepath = file.name;
            var filename = filepath.replace(/^.*?([^\\\/]*)$/, '$1');
            url += filename;
            var fd = new FormData();
            fd.append('file', file, filename);
            return $.ajax({
                type: 'PUT',
                url: url,
                data: fd,
                dataType: 'JSON',
                processData: false,
                contentType: false,
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                }
            });
        }

        /**
         *
         * Adds a text file to Dropbox
         *
         * @param sFilePath     string filepath of the file to save
         * @param sBody         string body of file to save
         * @param sMimeType     optional mime-type of the file to save; default is 'application/json'
         *
         */
        function putFileText(sFilePath, sBody, sMimeType) {
        	if( sMimeType === undefined){
        		sMimeType = 'application/json';
			}
            var url = 'https://content.dropboxapi.com/1/files_put/auto/';
            sFilePath = sFilePath.replace(/^.*?([^\\\/]*)$/, '$1');
            url += sFilePath;
            return $.ajax({
                type: 'PUT',
                url: url,
                data: sBody,
                contentType: sMimeType,
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                }
            });
        }

        /**
         *
         * Move a file from path 'from' to path 'to'
         *
         * @param from     the original string path of the file
         * @param to       the destination string path of the file
         *
         */
        function moveFile(from, to) {
            var data = {
                root: 'auto',
                from_path: from,
                to_path: to
            };
            return _operation('move', data);
        }

        /**
         *
         * Copy a file from path 'from' to path 'to'
         *
         * @param from     the string path of the file to copy
         * @param to       the destination string path of the file
         *
         */
        function copyFile(from, to) {
            var data = {
                root: 'auto',
                from_path: from,
                to_path: to
            };
            return _operation('copy', data);
        }

        /**
         *
         * Delete a file from path 'filePath'
         *
         * @param filePath     the string path of the file to delete
         *
         */
        function deleteFile(filePath) {
            var data = {
                root: 'auto',
                path: filePath
            };
            return _operation('delete', data);
        }

        /**
         *
         * Create a folder at path 'folderPath'
         *
         * @param folderPath     the string path of the folder to create
         *
         */
        function createFolder(folderPath) {
            var data = {
                root: 'auto',
                path: filePath
            };
            return _operation('create_folder', data);
        }

        function _operation(type, data) {
            var url = 'https://api.dropboxapi.com/1/fileops/' + type;
            return $.ajax({
                type: 'POST',
                url: url,
                data: $.param(data),
                dataType: 'JSON',
                processData: false,
                contentType: false,
                beforeSend: function(request) {
                    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                }
            });
        }

    }
})(window.jQuery);
