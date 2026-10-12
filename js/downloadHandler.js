// ============================================================
// downloadHandler.js
// Klik tombol Download -> hasilkan & unduh 2 file PNG terpisah
// sekaligus: peta KOTIM dan peta Seruyan (masing-masing dari
// container #mapStageKotim / #mapStageSeruyan, ukuran asli 1090x1086).
// ============================================================

// Target capture per kabupaten. Tambah region baru cukup tambah 1 baris di sini.
const DOWNLOAD_TARGETS = [
	{ key: "kotim", elementId: "mapStageKotim", fileLabel: "KOTIM" },
	{ key: "seruyan", elementId: "mapStageSeruyan", fileLabel: "SERUYAN" },
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

// Validasi bersama untuk tombol utama & tombol per kabupaten.
function validateBeforeDownload() {
	const waktuKosong = Array.from(waktu).some((el) => el.value === "");

	if (!viewClicked) {
		Swal.fire({
			title: 'Tidak Bisa Mendownload',
			text: "Silahkan Buka Tab View Terlebih Dahulu!",
			icon: 'warning',
			confirmButtonColor: '#3085d6',
		});
		return false;
	}

	if (waktuKosong) {
		Swal.fire({
			title: 'Tidak Bisa Mendownload',
			text: "Silahkan isi form dengan lengkap ",
			icon: 'warning',
			confirmButtonColor: '#3085d6',
		});
		return false;
	}

	return true;
}

// Download daftar target secara berurutan. Dipakai oleh tombol utama
// (semua target) maupun tombol per kabupaten (satu target).
function downloadTargets(targets) {
	if (!validateBeforeDownload()) return;

	const singleBtns = document.querySelectorAll(".download-single");
	const setDisabled = (state) => {
		downloadBtn.disabled = state;
		singleBtns.forEach((b) => (b.disabled = state));
	};
	setDisabled(true);

	// Berurutan (bukan Promise.all) dengan jeda kecil: kalau 2 blob di-saveAs()
	// persis bersamaan, Chrome bisa memblokir file kedua ("multiple automatic downloads").
	targets.reduce((chain, target) => {
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
			setDisabled(false);
		});
}

// Tombol utama: download semua (KOTIM + Seruyan), perilaku sama seperti sebelumnya.
downloadBtn.addEventListener("click", () => downloadTargets(DOWNLOAD_TARGETS));

// Tombol per kabupaten: download hanya gambar kabupaten tersebut.
document.querySelectorAll(".download-single").forEach((btn) => {
	btn.addEventListener("click", () => {
		const target = DOWNLOAD_TARGETS.find((t) => t.key === btn.dataset.target);
		if (target) downloadTargets([target]);
	});
});
