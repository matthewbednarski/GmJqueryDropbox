//(function(){


$(document).ready(function(event) {
    $(".has-token-indicator").hide();
    var has_creds = false;
    if (localStorage.dropbox_access !== undefined) {
        var dbt = JSON.parse(localStorage.dropbox_access);
        if (dbt.access_token !== undefined) {
            $("#token").val(dbt.access_token);
            window.dropbox = new Dropbox($("#token").val());
            $(".creds-container").hide();
            $(".has-token-indicator").show();
            hasCreds();
            has_creds = true;
        }
    }
    if (has_creds) {
        getFiles();

    } else {
        window.dropboxAuth = new DropboxAuth();
    }

}); // Fine document

function getFiles() {
    dropbox.files()
        .then(function(result) {
            console.dir(result);
        })
        .fail(function(err) {
            console.dir(err);
        });
}


function hasCreds() {
    $(".has-token-indicator").show();
    $(".has-token-indicator").css('background-color: green');
    $(".creds-container").hide();
    window.dropboxAuth = undefined;
}

function resetCreds() {
    $(".has-token-indicator").hide();
    $(".creds-container").show();
    window.dropboxAuth = new DropboxAuth();
    $("#token").val("");
    localStorage.dropbox_access = undefined;
}

function getAccessCode() {
    dropboxAuth.getAccessCode($("#appKey").val());
}

function getAuth() {
    dropboxAuth.getAuth($("#accessCode").val(), $("#appKey").val(), $("#appSecret").val())
        .then(function(result) {
            console.dir(result);
            localStorage.dropbox_access = JSON.stringify(result);
            $("#token").val(result.access_token);
            hasCreds();
            window.dropbox = new Dropbox($("#token").val());
        })
        .fail(function(error) {
            console.error('Error Loading...' + error);
            console.dir(error);
            resetCreds();
            $("#accessCode").val('');
            alert(error);
        });
}

//})();
