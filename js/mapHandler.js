// ============================================================
// mapHandler.js
// FUNCTION UNTUK MEMILIH PERINGATAN DI FORM (dropdown manual)
// ============================================================

function setMap(slug, selector) {
	const img = document.getElementsByName(slug)[0];
	if (img) {
		img.src = selector.value;
	}

	if (selector.value.endsWith(`${slug}1.png`)) {
		selector.style.backgroundColor = STATUS_COLOR[1];   // Wilayah Peringatan Dini
	} else if (selector.value.endsWith(`${slug}2.png`)) {
		selector.style.backgroundColor = STATUS_COLOR[2];   // Wilayah Potensi Meluas
	} else {
		selector.style.backgroundColor = STATUS_COLOR[0];   // Wilayah Tidak Terdampak
	}
}
