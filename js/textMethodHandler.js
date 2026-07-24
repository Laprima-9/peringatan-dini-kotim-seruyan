// ============================================================
// textMethodHandler.js
// Membaca pesan peringatan dini WA dan otomatis mengubah status
// kecamatan pada peta (KOTIM / Seruyan) sesuai region.
// ============================================================

function textToMap(region = 'kotim') {
	const config = REGION_CONFIG[region];
	if (!config) {
		console.error(`[textToMap] Region tidak dikenal: "${region}"`);
		return;
	}

	const textareaId = region === 'seruyan' ? 'text-method-seruyan' : 'text-method-kotim';
	const textarea = document.getElementById(textareaId);
	if (!textarea) {
		console.error(`[textToMap] Textarea #${textareaId} tidak ditemukan di halaman`);
		return;
	}

	let textOri = textarea.value;
	if (!textOri) {
		return;
	}

	// bersihkan format WA (bold *, CR, ganti baris baru dengan spasi)
	textOri = textOri
		.replace(/\*/g, '')
		.replace(/\r/g, '')
		.replace(/\n/g, ' ');

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
