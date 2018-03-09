// <script type="text/javascript">
// require("dotenv").config();
// var keys = require("./keys.js");


var ytResults = null;
var spotResults = null;
var selectedCat = null;



$(document).ready(function(){
  // get what user wants to do
  $(document).on("click", ".catBtn", function(){
    selectedCat = $(this).data("category");
    $(".search-wrap").removeClass("hide");
  });

  // on click submit for search form do action for category
  $("form").on("submit", function(e) {
     e.preventDefault();
     // prepare the request
     $("#results").append(`
        <img src="https://i.imgur.com/k8TI4sY.gif" class="loading">
      `)
     $("#submit").val("loading....");

     console.log(selectedCat);
      switch(selectedCat){
          case "youtube":
           getVideo();
          break;

          case "spotify":
          getID();
          break;

          case "giphy":
          getGif();
          break;

          case "postmates-f":
          getFood();
          break;

          case "postmates-u":
          getUndies();
          break

          case "saves":
          break;
      }
  });

  // click for any of the result buttons (next, clear, save)
  $(document).on("click", ".resultBtn", function(){

    var selectedBtn = $(this).text();

    switch(selectedBtn){
      case "next":
        // if selected catelgoy is youtube
        nextSong();

        // stop 
      break;
      case "clear":
        resetResults();
      break
      case "save":
        // call function to hit endpoint
      break

    }
  });

  
})

// create buttons for results and add them to a wrapper
function createButtons(i){
  var $btnWrap = $("<div>").addClass("resBtnWrap");

  var $next = $("<button>")
  $next.text("next").addClass("resultBtn nextBtn")
  if(i === 3){
    $next.addClass("hide");
  }else{
    $next.removeClass("hide");
  }
  
  var $clear = $("<button>")
  $clear.text("clear").addClass("resultBtn clearBtn")
  
  var $save = $("<button>")
  $save.text("save").addClass("resultBtn saveBtn")

  return $($btnWrap).append($next, $clear, $save)
}

// reset 
function resetResults(){
  ytResults = null;
  selectedCat = null
  $("#results").empty();
  $(".search-wrap").addClass("hide");

  // hide inout
}


/*////////////////////// YOUTUBE ///////////////////////////////*/

  // make call to youtube api and display 1 video on page
  function getVideo(){
    var request = gapi.client.youtube.search.list({
      part: "snippet",
      type: "video",
      q: encodeURIComponent($("#search").val()).replace(/%20/g, "+"),
      maxResults: 3,
      order: "viewCount",
      publishedAfter: "2015-01-01T00:00:00Z"
    }); 
     // execute the request
    request.execute(function(response) {
      $("#search").val("");
      //console.log(response);
      ytResults = response.items;
      console.log(results)
      var current = [ytResults[0]]
      var index = 0;
      displayVideo(current, index)

      resetVideoHeight();
      $(window).on("resize", resetVideoHeight);
    });
  }

  // create video and ad to a wrap and send to getVideo to be displayed
  function displayVideo(current, i){
    $("#submit").val("search")
     $("#results").empty();
      var $ytWrap = $("<div>")
      $ytWrap.addClass("currentVideo")
      $ytWrap.attr("data-video", i)
      console.log(current)

    $.each(current, function(index, item) {
      console.log(index, item);
      $.get("item.html", function(data) {
          $($ytWrap).append(tplawesome(data, [{"title":item.snippet.title, "videoid":item.id.videoId}]));
      });
      // save wrapper with result buttons to a variable
      var btns = createButtons(i)
      // ad video then wrap with buttons to page
      $("#results").append($ytWrap, btns);

    });
  }

  // styling for video
  function resetVideoHeight() {
      $(".video").css("height", $("#results").width() * 9/16);
  }

  // show next video (1-3)
  function nextYoutube(){
    // youtube 
        var current = $(".currentVideo").data("video");
        var next = [ytResults[current+1]]
        var i = current+1
        if(current < 3){
          $(".nextBtn").removeClass("hide");
          displayVideo(next, i);
        }
  }

  // rejex ?
  function tplawesome(e,t){
    res=e;for(var n=0;n<t.length;n++){
      res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){
        return t[n][r]
      })
    }return res
  }

  // youtube auth
  function init(){
      gapi.client.setApiKey("AIzaSyD0-_9xMJHK9CcHCP7JET7Pv3rSuYu3KUY");
      gapi.client.load("youtube", "v3", function() {
          // yt api is ready
      });
  }

/*//////////////////////END YOUTUBE ///////////////////////////////*/


/*////////////////////// SPOTIFY ///////////////////////////////*/
  var token;
  var expire_at;


  setInterval(function () {
    getToke()
  }, 3600000);

  // https://www.base64encode.org/
  // id:secret


  function getToke(){
    //  Spotify access token generation
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://accounts.spotify.com/api/token",
        type: 'POST',
        headers: {
            "Authorization": "Basic YzE0NWMxNzA3OWVjNGYzZmE4NTQxNDRlZTI5YWU2Y2E6OTQ4ZmVmZGE3YjYyNDdmYzkzZGE5YmJhMmRmMzA4Yjc=",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: { 'grant_type': 'client_credentials' },
        success: function (result) {
            token = result.access_token
            expire_at = result.expires_in
        }
    });
  }
  getToke();
  // var query = "linkin park"
  var query = $("#search").val();
  var artistId;
  function getID(){
    
    $.ajax({
        url: `https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/search?q=${query}&type=artist`,
        method: 'GET',
        headers: { "Authorization": "Bearer " + token },
        success: function (result) {
          artistID = result.artists.items[0].id
          console.log(artistID);
          getSong()
        }
    })
  }
  function getSong(){
    $.ajax({
        url: `https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/artists/${artistID}/top-tracks?country=US`,
        method: 'GET',
        headers: { "Authorization": "Bearer " + token },
        success: function (tracks) {
          console.log(tracks)
          //track[0].id

          spotResults = tracks.tracks
          console.log(spotResults);

          var current = spotResults[0]
          console.log("crnt",current);

          var index = 0;
          displaySong(current, index)
        }
    })
  }

  function displaySong(current, i){
    console.log(current);
    var songID = current.id
    $("#submit").val("search")
    $("#results").empty();
    var $songWrap = $("<div>");
    $songWrap.addClass("currentSong")
    $songWrap.attr("data-song", i)
    var showPlaylist = $("<iframe>");
    showPlaylist.attr({ id: "track", src: `https://open.spotify.com/embed?uri=spotify:track:${songID}`, width: "300", height: "380", frameborder: "0", allowtransparency: "true" })
   
    var btns = createButtons(i)
    $($songWrap).append(showPlaylist)
     $("#results").append($songWrap, btns);
  }

function nextSong(){
    // youtube 
        var current = $(".currentSong").data("song");
        var next = [spotResults[current+1]]
        var i = current+1
        if(current < 11){
          $(".nextBtn").removeClass("hide");
          displayVideo(next, i);
        }
  }

/*//////////////////////END SPOTIFY ///////////////////////////////*/

/*////////////////////// GIPHY ///////////////////////////////*/
/*//////////////////////END GIPHY ///////////////////////////////*/

/*////////////////////// POSTMATES FOOD///////////////////////////////*/
/*//////////////////////END POSTMATES ///////////////////////////////*/


/*////////////////////// POSTMATES UNDERWEAR ///////////////////////////////*/
/*//////////////////////END POSTMATES ///////////////////////////////*/

/*////////////////////// SAVES ///////////////////////////////*/
/*//////////////////////END SAVES ///////////////////////////////*/



