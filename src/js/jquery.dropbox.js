/***
 *
 * Extends jQuery with dropbox crud functionality
 *
 * All API methods return a promise unless specified otherwise.
 *
 */
jQuery(function($) {
    $.extend({
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
            var url = 'https://www.dropbox.com/oauth2/authorize';
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
            var url = 'https://api.dropboxapi.com/oauth2/token';
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
            var url = 'https://api.dropboxapi.com/2/users/get_current_account';
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
            var url = 'https://api.dropboxapi.com/2/files/list_folder';
            if (path === undefined || path === '') {
                path = ''
            }
            var data = {
                "path": path,
                "include_media_info": false,
                "include_deleted": false,
                "include_has_explicit_shared_members": false
            };
            return $.ajax({
                method: 'POST',
                url: url,
                data: JSON.stringify(data),
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                    request.setRequestHeader("Content-Type", 'application/json; charset=utf-8');
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
            var url = 'https://content.dropboxapi.com/2/files/download';
            if(content === undefined){
                content = {};
            }
            if(content.path === undefined || content.path === ''){
                content.path = '/';
            }
            var dropboxApiArg = {
                path: content.path
            };
            if (!dropboxApiArg.path.startsWith('/')){
                dropboxApiArg.path = '/' + dropboxApiArg.path;
            }
            return $.ajax({
                type: 'POST',
                url: url,
                dataType: 'blob',
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                    // request.setRequestHeader("Accept", content.mime_type);
                    request.setRequestHeader("Dropbox-API-Arg", JSON.stringify(dropboxApiArg));
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
            var url = 'https://content.dropboxapi.com/2/files/download';
            if(content === undefined){
                content = {};
            }
            if(content.path === undefined || content.path === ''){
                content.path = '/';
            }
            var dropboxApiArg = {
                path: content.path
            };
            if (!dropboxApiArg.path.startsWith('/')){
                dropboxApiArg.path = '/' + dropboxApiArg.path;
            }
            return $.ajax({
                type: 'POST',
                url: url,
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                    // request.setRequestHeader("Accept", content.mime_type);
                    request.setRequestHeader("Dropbox-API-Arg", JSON.stringify(dropboxApiArg));
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
        function putFile(file, path) {
            filename = '/';
            if (path !== undefined && !path.startsWith('/')) {
                filename += path;
            }else if (path !== undefined && path.startsWith('/')) {
                filename = path;
            }else if(file.name !== undefined){
                filename = file.name.replace(/^.*?([^\\\/]*)$/, '$1');

            }
            var url = 'https://content.dropboxapi.com/2/files/upload';
            var dropboxApiArg = {
                path: filename,
                mode: 'overwrite'
            };
            var fd = new FormData();
            fd.append('file', file, filename);
            return $.ajax({
                type: 'POST',
                url: url,
                data: fd,
                dataType: 'JSON',
                processData: false,
                contentType: false,
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                    request.setRequestHeader("Dropbox-API-Arg", JSON.stringify(dropboxApiArg));
                    request.setRequestHeader("Content-Type", 'application/octet-stream');
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
            if (!sFilePath.startsWith('/')) {
                sFilePath = '/' + sFilePath;
            }
            if ((typeof sBody ) !== 'string') {
                sBody = JSON.stringify(sBody);
            }
            var url = 'https://content.dropboxapi.com/2/files/upload';
            var dropboxApiArg = {
                path: sFilePath,
                mode: 'overwrite'
            };
            return $.ajax({
                type: 'POST',
                url: url,
                data: sBody,
                dataType: 'JSON',
                processData: false,
                contentType: false,
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                    request.setRequestHeader("Dropbox-API-Arg", JSON.stringify(dropboxApiArg));
                    request.setRequestHeader("Content-Type", 'application/octet-stream');
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
            if(!from.startsWith('/')){
                from = '/' + from;
            }
            if(!to.startsWith('/')){
                to = '/' + to;
            }
            var data = {
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
            if(!from.startsWith('/')){
                from = '/' + from;
            }
            if(!to.startsWith('/')){
                to = '/' + to;
            }
            var data = {
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
            if(!filePath.startsWith('/')){
                filePath = '/' + filePath;
            }
            var data = {
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
            if(!folderPath.startsWith('/')){
                folderPath = '/' + folderPath;
            }
            var data = {
                path: folderPath
            };
            return _operation('create_folder', data);
        }

        function _operation(type, data) {
            var sData = data;
            if ( (typeof data) !== 'string' ){
                sData = JSON.stringify( data );
            }
            var url = 'https://api.dropboxapi.com/2/files/' + type;
            return $.ajax({
                type: 'POST',
                url: url,
                data: sData,
                contentType: false,
                beforeSend: function(request) {
                    request.setRequestHeader('Content-Type', 'application/json');
                    request.setRequestHeader("Authorization", 'Bearer ' + access_token);
                }
            });
        }

    }
});

