//(function(){


$(document).ready(function(event) {

    if (localStorage.dropbox_access !== undefined) {
		var dbt = JSON.parse(localStorage.dropbox_access);
		if(dbt.access_token !== undefined){
        	$("#token").val(dbt.access_token);
        	window.dropbox = new Dropbox($("#token").val());
		}
    } else if (localStorage.appKey !== undefined) {
        $("#appKey").val(localStorage.appKey);
        if (localStorage.appSecret !== undefined) {
            $("#appSecret").val(localStorage.appSecret);
        }
    }
    window.dropboxAuth = new DropboxAuth();



    // if(localStorage.accessCode != undefined){
    //     $("#accessCode").val(localStorage.accessCode);
    //     $("#btGetAccessCode").attr("disabled","disabled");
    // }


}); // Fine document


function getAccessCode() {
	dropboxAuth.getAccessCode($("#appKey").val());
}

function setAccessCode() {
    localStorage.accessCode = $("#accessCode").val();
}


function getAuth() {
	dropboxAuth.getAuth($("#accessCode").val(), $("#appKey").val(), $("#appSecret").val())
        .then(function(result) {
            console.dir(result);
            localStorage.dropbox_access = JSON.stringify(result);
        	$("#token").val(result.access_token);
        	window.dropbox = new Dropbox($("#token").val());
        })
        .fail(function(error) {
            console.error('Error Loading...' + error);
            console.dir(error);
            alert(error);
        });
}

//})();
