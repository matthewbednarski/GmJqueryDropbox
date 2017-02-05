//(function(){


$(document).ready(function(event) {
    $(".has-token-indicator").hide();
    var has_creds = false;
    if (localStorage.dropbox_access !== undefined) {
        var dbt = JSON.parse(localStorage.dropbox_access);
        if (dbt.access_token !== undefined) {
            $("#token").val(dbt.access_token);
            has_creds = true;
        }
    }
    setupFileUpload();
    if (has_creds) {
        hasCreds();
    }

}); // Fine document


/**
 *
 * Setup Section
 *
 */
function setupFileUpload() {
    $('#fileupload').change(function(event) {
        $.dropbox.fileOps.createFolder('/test/lucky1')
        .then(function(){
            loadFiles();

        });
        /*
        $.dropbox.basic.addFileText('/test/folder/123/test.json', this)
        .then(function(){
            loadFiles();

        });
        var file = _.get($('#fileupload'), '[0].files[0]');
        if (file !== undefined) {
            addFile(file);
        }
        */
    });
}

function setupList() {
    $('#dropbox-files').off('click', '.dropbox-file');
    $('#dropbox-files').empty();
    $('#dropbox-files').on('click', '.dropbox-file', function(event) {
        var target = $(event.target);
        var data = target.data();
        getFile(data.path, data.mimeType)
            .then(function(res) {
                console.log('Successfully Downloaded file ' + res.file.name);
            });
    });
}

function hasCreds() {
    $(".has-token-indicator").show();
    $(".has-token-indicator").css('background-color: green');
    $(".creds-container").hide();
    $(".file-upload").show();
    $(".file-list").show();
    $.dropbox.setToken($("#token").val());
    loadFiles();
}

function resetCreds() {
    $(".has-token-indicator").hide();
    $(".creds-container").show();
    $("#token").val("");
    $.dropbox.setToken('');
    localStorage.dropbox_access = undefined;
    $(".file-upload").hide();
    $(".file-list").hide();
}

function loadFiles() {
    setupList();
    getFiles().then(handelFiles);
}

function appendList(html) {
    $('#dropbox-files').append(html);
}

function contentsToList(contents) {
    var template = {
        li_file: _.template('<div class="column column-block dropbox-file" ><a id="<%- file_source %>" data-path="<%- file_path %>" data-is-dir="<%- is_dir %>" data-mime-type="<%- file_mime_type %>" ><%- file_source %></a></div>'),
        li_dir: _.template('<div class="column column-block dropbox-file" ><a id="<%- file_source %>" data-path="<%- file_path %>" data-is-dir="<%- is_dir %>" ><%- file_source %></a></div>')
    };
    var li_html = _.chain(contents)
        .filter(function(content) {
            return !content.is_dir;
        })
        .map(function(content) {
            if (content.is_dir) {
                return template.li_dir({
                    file_source: content.path,
                    file_path: content.path,
                    is_dir: content.is_dir
                });
            } else {
                return template.li_file({
                    file_source: content.path,
                    file_path: content.path,
                    file_mime_type: content.mime_type,
                    is_dir: content.is_dir
                });
            }
        })
        .value();
    var html = _.reduce(li_html, function(html, li) {
        html += li + '\n';
        return html;
    }, '');

    return html;
}

function handelFiles(filesObj) {
    _.merge(f, filesObj.files);
    Q.allSettled(filesObj.promises)
        .done(function(filesArr) {
            _.forEach(filesArr, function(filePromise) {
                handelFiles(filePromise.value);
            });
        });

    var html = contentsToList(filesObj.files);
    appendList(html);
}

/**
 *
 * Dropbox API Section
 *
 */
function getFiles(path) {
    if (window.f === undefined) {
        window.f = [];
    } else if (path === undefined) {
        _.remove(window.f);
    }
    return $.dropbox.basic.getFiles(path)
        .then(function(files) {
            // console.dir(files.contents);
            var entries = _.chain(files.entries)
                .map(function(content) {
                	content.path = content.path_lower;
                	return content;
                })
                .map(function(content) {
					if(content['.tag'] === 'folder'){
						content.is_dir = true;
					}else{
						content.is_dir = false;
					}
                	return content;
                })
                .value();

            var promises = _.chain(files.entries)
                .filter(function(content) {
					return content.is_dir;
                })
                .map(function(content) {
                	//console.log(content);
                    var p = getFiles(content.path)
                    return p;
                })
                .value();
            var files = _.chain(files.entries)
                .filter(function(content) {
					return !content.is_dir;
                })
                .map(function(content) {
                    return content;
                })
                .value();
            return {
                files: files,
                promises: promises
            };
        });
}

function getFile(path, mime_type) {
    var gotten = $.dropbox.basic.getFile({
            path: path,
            mime_type: mime_type
        })
        .then(function(res) {
            if (res !== undefined) {
                var name = path.substring(1);
                var file = new File([res], name, {
                    type: res.type
                });
                var url = URL.createObjectURL(file);
                return {
                    blob: res,
                    file: file,
                    url: url
                };
            }else {
				throw new Error('Result is undefined');
			}
        });
    gotten.then(function(res) {
        console.log(res);
        if (res !== undefined && res.url !== undefined) {
            window.open(res.url);
        }
    });
    return gotten;
}

function addFile(file) {
    $.dropbox.basic.putFile(file)
        .then(function() {
            loadFiles();
        });
}

/**
 * Auth Section
 *
 */
function getAccessCode() {
    $.dropboxAuth.getAccessCode($('#appKey').val());
}

function getAuth() {
    $.dropboxAuth.getAuth($('#accessCode').val(), $('#appKey').val(), $('#appSecret').val())
        .then(function(result) {
            console.dir(result);
            localStorage.dropbox_access = JSON.stringify(result);
            $("#token").val(result.access_token);
            hasCreds();
        })
        .fail(function(error) {
            console.error('Error Loading...' + error);
            console.dir(error);
            resetCreds();
            $('#accessCode').val('');
        });
}

//})();
