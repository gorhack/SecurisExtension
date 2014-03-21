jQuery.fn.getPath = function () {
    if (this.length != 1) throw 'Requires one element.';

    var path, node = this;
    while (node.length) {
        var realNode = node[0],
            name = realNode.localName;
        if (!name) break;
        name = name.toLowerCase();

        var parent = node.parent();

        var siblings = parent.children(name);
        if (siblings.length > 1) {
            name += ':eq(' + siblings.index(realNode) + ')';
        }

        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
};

function findForms() {
    return $('form').filter(function () {
        return $(this).find('input[type=password]').length > 0;
    });
}

function getPasswordFields(form) {
    return $(form).find('input[type=password]');
}

// function to send GET request to search for domain
function searchAcccountsForURL(searchTerm) {
    var dataArr = new Array();
    var getting = $.get("https://securis-debug.herokuapp.com/search_accounts_for_url.json", {
        "search_term": searchTerm
    }, function (data) {
        console.log(data);
        dataArr = data;
    });

    // if errors, incorrect auth_token or email, log in again
    getting.error(function (data) {
        console.log("Error: " + data);
    });
    return dataArr;
}

function fillPathWithValue(path, val) {
    $(path).val(val);
}

findForms().submit(function (event) {
    var formAttributes = [];
    var accountAttributes = {
        'name': document.title
    };
    if (confirm("Do you want to save this password in Securis?")) {
        $(this).find('input[type!=hidden],select').each(function () {
            formAttributes.push({
                "autofill_path": $(this).getPath(),
                "value": $(this).val(),
                "name": $(this).prop("name"),
                "is_secure": $(this).prop('type') == 'password'
            });
        });
        formAttributes.push({
            "name": "Website",
            "value": document.URL,
            "is_url": true
        });

        var message = {
            action_name: "create",
            account: accountAttributes,
            fields: formAttributes
        };
        chrome.runtime.sendMessage(message, function (response) {});
    }
});