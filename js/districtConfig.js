// ============================================================
// districtConfig.js
// Sumber data tunggal (single source of truth) untuk nama
// kecamatan, slug, dan folder aset tiap kabupaten.
// Dipakai oleh: mapHandler.js dan textMethodHandler.js
// ============================================================

const REGION_CONFIG = {
	kotim: {
		label: 'Kotawaringin Timur',
		folder: 'kotim',
		districts: {
			'Antang Kalang': 'antangkalang',
			'Pulau Hanaut': 'pulauhanaut',
			'Baamang': 'baamang',
			'Seranau': 'seranau',
			'Bukit Santuai': 'bukitsantuai',
			'Telaga Antang': 'telagaantang',
			'Cempaga': 'cempaga',
			'Telawang': 'telawang',
			'Cempaga Hulu': 'cempagahulu',
			'Teluk Sampit': 'teluksampit',
			'Kota Besi': 'kotabesi',
			'Tualan Hulu': 'tualanhulu',
			'Mentawa Baru Ketapang': 'mentawabaruketapang',
			'Mentaya Hilir Selatan': 'mentayahilirselatan',
			'Mentaya Hilir Utara': 'mentayahilirutara',
			'Mentaya Hulu': 'mentayahulu',
			'Parenggean': 'parenggean',
		}
	},
	seruyan: {
		label: 'Seruyan',
		folder: 'seruyan',
		districts: {
			'Batu Ampar': 'batuampar',
			'Danau Seluluk': 'danauseluluk',
			'Danau Sembuluh': 'danausembuluh',
			'Hanau': 'hanau',
			'Seruyan Hilir': 'seruyanhilir',
			'Seruyan Hilir Timur': 'seruyanhilirtimur',
			'Seruyan Hulu': 'seruyanhulu',
			'Seruyan Raya': 'seruyanraya',
			'Seruyan Tengah': 'seruyantengah',
			'Suling Tambun': 'sulingtambun',
		}
	}
};

// status: 1 = Wilayah Peringatan Dini, 2 = Wilayah Potensi Meluas, 0 = Normal
const STATUS_COLOR = {
	1: '#fe9603',
	2: '#effb1b',
	0: '#6cfd3e',
};

function buildImagePath(folder, slug, status) {
	const suffix = status === 0 ? '' : String(status);
	return `asset/img/printmap/${folder}/${slug}${suffix}.png`;
}

// Menerapkan status (1/2/0) ke gambar peta + dropdown terkait,
// dipakai baik oleh Text Method maupun dropdown manual.
function applyDistrictStatus(slug, folder, status) {
	const src = buildImagePath(folder, slug, status);

	const img = document.getElementsByName(slug)[0];
	if (img) img.src = src;

	const select = document.querySelector('select.' + slug);
	if (select) {
		select.value = src;
		select.style.backgroundColor = STATUS_COLOR[status];
	}
}
