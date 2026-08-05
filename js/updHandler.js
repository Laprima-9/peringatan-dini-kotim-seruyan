// ============================================================
// updHandler.js
// Mengubah teks mentah Peringatan Dini BMKG (format WhatsApp)
// menjadi teks siap upload ke stamet.bmkgkotim.id, difilter
// hanya untuk wilayah Kotawaringin Timur, Katingan, dan Seruyan.
// Dipanggil dari textMethodHandler.js saat tombol Convert diklik.
// ============================================================

// Hanya kabupaten ini yang boleh muncul di hasil UPD.
// Urutan tidak berpengaruh - urutan hasil mengikuti urutan
// kemunculan kabupaten pada teks sumber.
const UPD_ALLOWED_REGIONS = ['Kotawaringin Timur', 'Katingan', 'Seruyan'];

/**
 * Mengubah teks mentah WA BMKG menjadi teks UPD yang sudah
 * difilter & dirapikan sesuai format stamet.bmkgkotim.id.
 * @param {string} rawText - isi textarea apa adanya (dengan baris baru asli)
 * @returns {string}
 */
function generateUpdText(rawText) {

    if (!rawText) return '';

    let text = rawText
        .replace(/\r/g, '')
        .replace(/\*/g, '')
        .replace(
            /UPDATE\s+Peringatan\s+Dini\s+Cuaca\s+Kalimantan\s+Tengah\s*/i,
            ''
        )
        .replace(/\btgl\b/gi, 'Tanggal')
        .replace(/pkl\./gi, 'pukul')
        .replace(/\bpkl\b/gi, 'pukul')
        .trim();

    // Pisah bagian "Dan dapat meluas ke wilayah"
    const splitMarker = /Dan dapat meluas ke\s*wilayah/i;

    const parts = text.split(splitMarker);

    const beforeExpand = parts[0] || '';
    const afterExpand = parts[1] || '';

    // Ambil penutup
    const tailMatch =
        afterExpand.match(/Kondisi ini diperkirakan[\s\S]*$/i);

    const tailText =
        tailMatch ? tailMatch[0].trim() : '';

    const expandBody =
        tailMatch
            ? afterExpand.slice(0, tailMatch.index)
            : afterExpand;

    // Filter wilayah hanya pada bagian meluas
    const regionRegex =
        /Kabupaten\s+([^:]+):\s*([^]*?)(?=Kabupaten\s+[^:]+:|Kota\s+[^:]+:|$)/gi;

    const allowed = [
        'Kotawaringin Timur',
        'Katingan',
        'Seruyan'
    ];

    const keptRegions = [];
    const hasDanSekitarnya = /dan sekitarnya/i.test(afterExpand);

    let match;

    while ((match = regionRegex.exec(expandBody)) !== null) {

        const regionName = match[1].trim();

        if (!allowed.includes(regionName))
            continue;

        let content = match[2]
            .replace(/\s+/g, ' ')
            .replace(/,?\s*dan sekitarnya\.?/i, '')
            .trim();

        keptRegions.push(
            `Kabupaten ${regionName}: ${content}`
        );
    }

    let result = beforeExpand.trim();

    if (keptRegions.length) {
        const regionText = keptRegions
            .map((line, idx) => {
                const isLast = idx === keptRegions.length - 1;
                return line + (isLast ? (hasDanSekitarnya ? ' dan sekitarnya.' : '') : '');
            })
            .join('\n');

        result +=
            '\n\nDan dapat meluas ke wilayah\n' +
            regionText;
    }

    if (tailText) {

        result += '\n\n' + tailText;
    }

    return result
        .replace(/\s+\./g, '.')
        .replace(/\s+,/g, ',')
        .trim();
}

/**
 * Membaca textarea shared (#text-method-shared), membuat teks UPD,
 * dan menampilkannya di textarea hasil (#upd-result).
 * @param {string} rawText
 */
function renderUpdResult(rawText) {
	const updResultEl = document.getElementById('upd-result');
	if (!updResultEl) return;
	updResultEl.value = generateUpdText(rawText);
}

/**
 * Menyalin isi textarea hasil UPD ke clipboard, dipanggil dari
 * tombol Copy di tab UPD.
 */
function copyUpdResult() {
	const updResultEl = document.getElementById('upd-result');
	if (!updResultEl || !updResultEl.value) {
		Swal.fire({
			title: 'Belum ada hasil',
			text: 'Klik tombol Convert pada tab Form terlebih dahulu.',
			icon: 'warning',
			confirmButtonColor: '#3085d6',
		});
		return;
	}

	const showSuccess = () => {
		Swal.fire({
			title: 'Berhasil disalin',
			text: 'Teks UPD sudah ada di clipboard.',
			icon: 'success',
			confirmButtonColor: '#3085d6',
			timer: 1500,
			showConfirmButton: false,
		});
	};

	const showError = () => {
		Swal.fire({
			title: 'Gagal menyalin',
			text: 'Silahkan salin manual dari kotak teks.',
			icon: 'error',
			confirmButtonColor: '#3085d6',
		});
	};

	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(updResultEl.value).then(showSuccess).catch(() => {
			// fallback untuk browser/izin yang menolak Clipboard API
			fallbackCopy(updResultEl, showSuccess, showError);
		});
	} else {
		fallbackCopy(updResultEl, showSuccess, showError);
	}
}

function fallbackCopy(textareaEl, onSuccess, onError) {
	try {
		textareaEl.select();
		textareaEl.setSelectionRange(0, textareaEl.value.length);
		const ok = document.execCommand('copy');
		ok ? onSuccess() : onError();
	} catch (err) {
		onError();
	}
}