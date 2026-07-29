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

// Terapkan isi field Jam (manual maupun hasil ekstraksi otomatis)
// ke overlay peta KOTIM & Seruyan sekaligus.
function applyJamToAll(selector) {
    timeToSet('time-kotim', selector);
    timeToSet('time-seruyan', selector);
}

// Ambil jam mulai (setelah "pada pkl.") dan jam selesai (setelah
// "hingga pkl") dari teks BMKG, lalu gabungkan jadi satu string
// dengan format "HH:MM-HH:MM WIB". Mengembalikan null kalau salah
// satu / kedua jam tidak ditemukan.
function extractTimeRange(text) {
    if (!text) return null;

    const startMatch = text.match(/pada\s+pkl\.?\s*(\d{1,2}[.:]\d{2})/i);
    const endMatch = text.match(/hingga\s+pkl\.?\s*(\d{1,2}[.:]\d{2})/i);

    if (!startMatch || !endMatch) return null;

    const normalize = (jam) => jam.replace('.', ':');

    return `${normalize(startMatch[1])}-${normalize(endMatch[1])} WIB`;
}
