// ============================================================
// textMethodHandler.js
// Membaca satu pesan peringatan dini WA dan otomatis mengubah
// status kecamatan pada peta KOTIM & Seruyan sekaligus, serta
// mengekstrak rentang jam kejadian dari teks yang sama.
// ============================================================

function textToMap() {
	const textarea = document.getElementById('text-method-shared');
	if (!textarea) {
		console.error('[textToMap] Textarea #text-method-shared tidak ditemukan di halaman');
		return;
	}

	const textRaw = textarea.value;
	if (!textRaw) {
		return;
	}

	// bersihkan format WA (bold *, CR, ganti baris baru dengan spasi)
	const textOri = textRaw
		.replace(/\*/g, '')
		.replace(/\r/g, '')
		.replace(/\n/g, ' ');

	// satu input ini berlaku untuk semua kabupaten yang terdaftar
	// di REGION_CONFIG (KOTIM & Seruyan)
	Object.keys(REGION_CONFIG).forEach((region) => {
		applyRegionFromText(textOri, REGION_CONFIG[region]);
	});

	applyExtractedTime(textRaw);
}

function applyRegionFromText(textOri, config) {
	const peringatanDiniArray = textOri.split(
		'berpotensi terjadi Hujan Sedang-Lebat yang dapat disertai Kilat/Petir dan Angin Kencang'
	);
	const meluasKeArray = textOri.split('Dan dapat meluas ke wilayah');

	const marker = `Kabupaten ${config.label}:`;

	const searchByRegion = peringatanDiniArray[1] ? peringatanDiniArray[1].split(marker) : [];
	const searchByRegion2 = meluasKeArray[1] ? meluasKeArray[1].split(marker) : [];

	const peringatanDiniList = searchByRegion[1] ? searchByRegion[1].split(',') : [];

	// hanya proses "meluas ke" jika marker kabupaten benar-benar ditemukan,
	// supaya tidak salah ambil potongan teks kabupaten lain
	const meluasKeList = searchByRegion2[1]
		? searchByRegion2[searchByRegion2.length - 1].split(',')
		: [];

	applyListToMap(peringatanDiniList, config, 1);
	applyListToMap(meluasKeList, config, 2);
}

function applyListToMap(rawList, config, status) {
	rawList
		.map((name) => name.replace(/\.$/, '').trim())
		.filter(Boolean)
		.forEach((name) => {
			const slug = config.districts[name];
			if (slug) {
				applyDistrictStatus(slug, config.folder, status);
			} else {
				// membantu debugging jika format pesan WA berubah / nama kecamatan salah ketik
				console.warn(`[textToMap] Nama kecamatan tidak dikenali untuk region "${config.label}": "${name}"`);
			}
		});
}

// Mengambil jam mulai (setelah "pada pkl.") dan jam selesai
// (setelah "hingga pkl"), lalu mengisi field Jam + overlay peta
// KOTIM & Seruyan sekaligus dengan format "HH:MM-HH:MM WIB".
function applyExtractedTime(textRaw) {
	const timeRange = extractTimeRange(textRaw);
	if (!timeRange) {
		console.warn('[textToMap] Jam mulai/selesai tidak ditemukan pada teks, field Jam tidak diubah');
		return;
	}

	const jamInput = document.getElementById('timeSet');
	if (jamInput) jamInput.value = timeRange;

	timeToSet('time-kotim', { value: timeRange });
	timeToSet('time-seruyan', { value: timeRange });
}

let statusViewTab = false;
document.getElementById("view-tab").addEventListener("click", () => {
	if (!statusViewTab) {
		Swal.fire({
			title: 'Pemberitahuan',
			text: "Silahkan Tunggu Sampai Peta Terload Semua!",
			icon: 'info',
			confirmButtonColor: '#3085d6',
		})
		statusViewTab = true;
	}
})
