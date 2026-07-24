  let viewClicked = false,
    downloadBtn = document.getElementById("download"),
    viewBtn = document.getElementById("view-tab"),
    formBtn = document.getElementById("form-tab"),
    view = document.getElementById("view"),
    pemberitahuan = document.querySelector(".pemberitahuan"),
    waktu = document.querySelectorAll(".time-overlay")


  viewBtn.addEventListener("click", () => {
    viewClicked = true
  });
  formBtn.addEventListener("click", () => {
    viewClicked = false
  });

  
