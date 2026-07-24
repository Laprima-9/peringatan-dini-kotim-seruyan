// ============================================================
// downloadHandler.js
// Klik tombol Download -> hasilkan & unduh 2 file PNG terpisah
// sekaligus: peta KOTIM dan peta Seruyan (masing-masing dari
// container #mapStageKotim / #mapStageSeruyan, ukuran asli 1090x1086).
// ============================================================

// Target capture per kabupaten. Tambah region baru cukup tambah 1 baris di sini.
const DOWNLOAD_TARGETS = [
	{ elementId: "mapStageKotim", fileLabel: "KOTIM" },
	{ elementId: "mapStageSeruyan", fileLabel: "SERUYAN" },
];

function captureAndSave(target, opt) {
	const el = document.getElementById(target.elementId);
	if (!el) {
		console.error(`[download] Elemen #${target.elementId} tidak ditemukan`);
		return Promise.resolve();
	}

	return domtoimage.toBlob(el, opt).then(function (blob) {
		window.saveAs(
			blob,
			`PERINGATAN DINI ${target.fileLabel} ${today.format("D MMMM YYYY")}.png`
		);
	});
}

downloadBtn.addEventListener("click", () => {
	const waktuKosong = Array.from(waktu).some((el) => el.value === "");

	if (!viewClicked) {
		Swal.fire({
			title: 'Tidak Bisa Mendownload',
			text: "Silahkan Buka Tab View Terlebih Dahulu!",
			icon: 'warning',
			confirmButtonColor: '#3085d6',
		});
		return;
	}

	if (waktuKosong) {
		Swal.fire({
			title: 'Tidak Bisa Mendownload',
			text: "Silahkan isi form dengan lengkap ",
			icon: 'warning',
			confirmButtonColor: '#3085d6',
		});
		return;
	}

	downloadBtn.disabled = true;

	// Jalankan berurutan (bukan Promise.all) dengan jeda kecil di antaranya.
	// Ini penting: kalau 2 blob di-saveAs() persis di waktu yang sama,
	// sebagian browser (terutama Chrome) menganggapnya "multiple automatic
	// downloads" dan cuma meloloskan file pertama, sisanya diblokir /
	// butuh izin manual dari user (ikon "Downloads blocked" di address bar).
	DOWNLOAD_TARGETS.reduce((chain, target) => {
		return chain.then(() => {
			const el = document.getElementById(target.elementId);
			const opt = el
				? { quality: 1.5, width: el.scrollWidth, height: el.scrollHeight }
				: { quality: 1.5 };
			return captureAndSave(target, opt).then(
				() => new Promise((resolve) => setTimeout(resolve, 300))
			);
		});
	}, Promise.resolve())
		.catch((err) => {
			console.error('[download] Gagal membuat gambar:', err);
			Swal.fire({
				title: 'Gagal Mendownload',
				text: "Terjadi kesalahan saat membuat gambar peta.",
				icon: 'error',
				confirmButtonColor: '#3085d6',
			});
		})
		.finally(() => {
			downloadBtn.disabled = false;
		});
});
