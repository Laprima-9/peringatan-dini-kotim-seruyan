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

    // PENTING: asterisk (*bold*) belum dibuang di tahap ini. Label
    // kabupaten/kota asli pada pesan WA BMKG SELALU dibungkus utuh oleh
    // sepasang asterisk, termasuk tanda titik duanya - contoh persis:
    // "*Kabupaten Kotawaringin Timur:*" atau "*Kota Palangkaraya:*".
    // Nama kecamatan di dalam daftar TIDAK PERNAH dibungkus asterisk.
    // Pembatas blok kabupaten di bawah memanfaatkan ciri ini, bukan
    // posisi baris baru - supaya tetap benar baik pesan WA ditempel
    // dengan baris baru asli maupun menyambung jadi satu paragraf, dan
    // supaya kecamatan yang kebetulan diawali kata "Kota" (mis. "Kota
    // Besi" di Kotim) tidak pernah salah terbaca sebagai kabupaten baru.
    let text = rawText
        .replace(/\r/g, '')
        .replace(
            /\*?UPDATE\s+Peringatan\s+Dini\s+Cuaca\s+Kalimantan\s+Tengah\*?\s*/i,
            ''
        )
        .replace(/\btgl\b/gi, 'Tanggal')
        .replace(/pkl\./gi, 'pukul')
        .replace(/\bpkl\b/gi, 'pukul')
        .trim();

    // Pisah bagian "Dan dapat meluas ke wilayah" (asterisk biasanya cuma
    // membungkus "Dan dapat meluas ke", kata "wilayah" di luar asterisk).
    const splitMarker = /\*?Dan dapat meluas ke\*?\s*wilayah/i;

    const parts = text.split(splitMarker);

    const beforeExpand = parts[0] || '';
    const afterExpand = parts[1] || '';

    // Ambil penutup (asterisk biasanya cuma membungkus kalimat
    // "Kondisi ini diperkirakan masih akan berlangsung").
    const tailMatch =
        afterExpand.match(/\*?Kondisi ini diperkirakan[\s\S]*$/i);

    const tailText =
        tailMatch ? tailMatch[0].replace(/\*/g, '').trim() : '';

    const expandBody =
        tailMatch
            ? afterExpand.slice(0, tailMatch.index)
            : afterExpand;

    // Cari semua label "*Kabupaten X:*" / "*Kota X:*" di expandBody
    // berdasarkan pembungkus asterisknya, lalu ambil isi tiap blok dari
    // akhir satu label sampai awal label berikutnya (atau akhir teks).
    const labelRegex = /\*(Kabupaten|Kota)\s+([^:*]+):\*/g;

    const labels = [];
    let labelMatch;
    while ((labelMatch = labelRegex.exec(expandBody)) !== null) {
        labels.push({
            start: labelMatch.index,
            name: labelMatch[2].trim(),
            contentStart: labelRegex.lastIndex,
        });
    }

    const allowed = [
        'Kotawaringin Timur',
        'Katingan',
        'Seruyan'
    ];

    const hasDanSekitarnya = /dan sekitarnya/i.test(afterExpand);

    // Isi tiap blok kabupaten = dari akhir label ini sampai AWAL label
    // berikutnya (siapa pun kabupatennya, diizinkan atau tidak) - supaya
    // kabupaten yang tidak diizinkan di antaranya tetap jadi pembatas
    // yang benar, bukan ikut tertelan ke kabupaten sebelumnya.
    const regionLines = [];
    labels.forEach((label, idx) => {
        if (!allowed.includes(label.name)) return;

        const nextLabel = labels[idx + 1];
        const end = nextLabel ? nextLabel.start : expandBody.length;

        let content = expandBody
            .slice(label.contentStart, end)
            .replace(/\*/g, '')
            .replace(/\s+/g, ' ')
            .replace(/,?\s*dan sekitarnya\.?/i, '')
            .trim();

        regionLines.push(`Kabupaten ${label.name}: ${content}`);
    });

    let result = beforeExpand.replace(/\*/g, '').trim();

    if (regionLines.length) {
        const regionText = regionLines
            .map((line, idx) => {
                const isLast = idx === regionLines.length - 1;
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

/**
 * Buka halaman web Update Peringatan Dini BMKG pada tab baru.
 */
function openUpdWeb() {
    const url = 'http://192.168.1.80:8080/peringatan-dini/';
    // Prefer a direct navigation if popup blockers prevent window.open
    try {
        const newWin = window.open(url, '_blank',);
        if (!newWin) {
            // fallback: navigate current window
            window.location.href = url;
        }
    } catch (e) {
        Swal.fire({
            title: 'Gagal membuka halaman',
            text: `Silahkan kunjungi ${url} secara manual.`,
            icon: 'error',
            confirmButtonColor: '#3085d6',
        });
    }
}
