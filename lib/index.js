import "./diary.scss";
import "./foods.scss";

let view = localStorage.getItem('view') || 'diary.html'
$("#content").load("../" + view);

$(document).ready(function() {
  $("#content").on("click", ".change-views", function(e){
    let newView = e.currentTarget.dataset.path;
    localStorage.setItem('view', newView);
    $("#content").load("../" + e.currentTarget.dataset.path);
  });
})
