/**
 * Created by Sentry on 3/17/17.
 */

(function(){
	var networks = [{
        url: "https://www.instagram.com/accounts/login/?next=%2Ffavicon.ico",
        name: "Instagram"
    }, {
        url: "https://twitter.com/login?redirect_after_login=%2Ffavicon.ico",
        name: "Twitter"
    }, {
        url: "https://www.facebook.com/login.php?next=https%3A%2F%2Fwww.facebook.com%2Ffavicon.ico%3F_rdr%3Dp",
        name: "Facebook"
    }, {
        url: "https://accounts.google.com/ServiceLogin?passive=true&continue=https%3A%2F%2Fwww.google.com%2Ffavicon.ico&uilel=3&hl=de&service=youtube",
        name: "Google"
    }, {
        url: "https://www.dropbox.com/login?cont=https%3A%2F%2Fwww.dropbox.com%2Fstatic%2Fimages%2Ficons%2Ficon_spacer-vflN3BYt2.gif",
        name: "Dropbox"
    }];


//     Do not work because they do not immediately redirect
//     {
//         url: "https://login.live.com/login.srf?wa=wsignin1.0&wreply=https%3A%2F%2Fprofile.microsoft.com%2FregsysProfilecenter%2FImages%2FLogin.jpg",
//         name: "Microsoft"
//     }, {
//         url: "https://github.com/login?return_to=https%3A%2F%2Fgithub.com%2Ffavicon.ico%3Fid%3D1",
//         name: "Github"
//     }, {
//         url: "https://slack.com/signin?redir=%2Ffavicon.ico",
//         name: "Slack"
//     }, {
//         url: "https://tablet.www.linkedin.com/splash?redirect_url=https%3A%2F%2Fwww.linkedin.com%2Ffavicon.ico%3Fgid%3D54384%26trk%3Dfulpro_grplogo",
//         name: "Linkedin"
//     }


    function print(network, status) {
        document.getElementById(network).innerHTML = status;
    }
    networks.forEach(function(network) {
        var img = document.createElement('img');
        img.src = network.url;
        img.onload = function() {
            print(network.name,'logged_in');
        };
        img.onerror = function() {
           print(network.name, 'not logged in');
        };
    });
}());