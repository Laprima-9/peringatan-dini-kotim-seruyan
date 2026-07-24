let today;
document.addEventListener("DOMContentLoaded", function () {
    moment.locale("id");
    today = moment();
    document.querySelectorAll(".date-overlay").forEach(function(el){
        el.value = today.format("D MMMM YYYY");
    });

});

function timeToSet(timee, selector) {
    var settime = document.getElementsByName(timee)[0];
    settime.value = selector.value;
}
