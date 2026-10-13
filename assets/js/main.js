/* JavaScript hanya menambah interaksi; isi utama tetap berada di index.html. */
(() => {
  const halaman = document.documentElement;
  const tombolMenu = document.querySelector('.tombol-menu');
  const menu = document.getElementById('menu-utama');
  const layarKecil = window.matchMedia('(max-width: 860px)');
  const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tombolGerak = document.getElementById('tombol-gerak');
  const teksGerak = document.getElementById('teks-gerak');
  const kontrolAnimasi = document.getElementById('kontrol-animasi');
  const petunjukAnimasi = document.getElementById('petunjuk-animasi');
  const ilustrasi = document.querySelector('[data-miring]');
  const kunciSimpanan = 'ambang-biru-motion-paused';
  let gerakDijeda = false;
  let pemantauKemunculan;
  let bingkaiKemiringan;

  // Penyimpanan bisa dibatasi browser. Website tetap berfungsi jika itu terjadi.
  try {
    gerakDijeda = localStorage.getItem(kunciSimpanan) === 'true';
  } catch {
    gerakDijeda = false;
  }

  halaman.classList.add('js-aktif');
  tombolMenu.hidden = false;
  kontrolAnimasi.hidden = false;

  // MENU HP: tutup saat berpindah bagian, menekan Escape, atau kembali ke desktop.
  function aturMenu(buka, kembalikanFokus = false) {
    const terbuka = layarKecil.matches && buka;
    tombolMenu.setAttribute('aria-expanded', String(terbuka));
    menu.hidden = layarKecil.matches && !terbuka;
    if (kembalikanFokus) tombolMenu.focus();
  }

  aturMenu(false);
  tombolMenu.addEventListener('click', () => {
    aturMenu(tombolMenu.getAttribute('aria-expanded') !== 'true');
  });
  menu.querySelectorAll('a').forEach((tautan) => {
    tautan.addEventListener('click', () => aturMenu(false));
  });
  document.addEventListener('keydown', (kejadian) => {
    if (
      kejadian.key === 'Escape' &&
      tombolMenu.getAttribute('aria-expanded') === 'true'
    ) {
      aturMenu(false, true);
    }
  });
  layarKecil.addEventListener('change', () => aturMenu(false));

  function aturUlangKemiringan() {
    cancelAnimationFrame(bingkaiKemiringan);
    ilustrasi.style.setProperty('--miring-x', '0deg');
    ilustrasi.style.setProperty('--miring-y', '0deg');
  }

  // GERAK: tombol menyimpan pilihan lokal; preferensi perangkat tetap diutamakan.
  function apakahGerakDijeda() {
    return gerakDijeda || kurangiGerak.matches;
  }

  function terapkanGerak() {
    const dijeda = apakahGerakDijeda();
    halaman.classList.toggle('gerak-dijeda', dijeda);
    tombolGerak.disabled = kurangiGerak.matches;
    // Label menyebut tindakan berikutnya supaya fungsi tombol langsung jelas.
    teksGerak.textContent = kurangiGerak.matches
      ? 'Animasi dikurangi'
      : dijeda
        ? 'Aktifkan animasi'
        : 'Jeda animasi';
    petunjukAnimasi.textContent = kurangiGerak.matches
      ? 'Animasi dikurangi mengikuti pengaturan perangkatmu.'
      : 'Untuk label melayang, ilustrasi, dan efek saat menggulir.';

    if (dijeda) {
      aturUlangKemiringan();
      halaman.classList.remove('efek-muncul-aktif');
      pemantauKemunculan?.disconnect();
      document
        .querySelectorAll('.muncul-bertahap')
        .forEach((elemen) => elemen.classList.add('sudah-terlihat'));
    }
  }

  terapkanGerak();
  tombolGerak.addEventListener('click', () => {
    gerakDijeda = !gerakDijeda;
    try {
      localStorage.setItem(kunciSimpanan, String(gerakDijeda));
    } catch {
      // Pilihan tetap berlaku untuk halaman ini meskipun tidak dapat disimpan.
    }
    terapkanGerak();
  });
  kurangiGerak.addEventListener('change', terapkanGerak);

  // BAB: elemen muncul sekali saat terlihat; tidak menyembunyikan isi tanpa JS.
  if ('IntersectionObserver' in window && !apakahGerakDijeda()) {
    pemantauKemunculan = new IntersectionObserver(
      (daftarBagian, pemantau) => {
        daftarBagian.forEach((bagian) => {
          if (bagian.isIntersecting) {
            bagian.target.classList.add('sudah-terlihat');
            pemantau.unobserve(bagian.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll('.muncul-bertahap')
      .forEach((elemen) => pemantauKemunculan.observe(elemen));
    halaman.classList.add('efek-muncul-aktif');
  }

  // PENANDA BAB: menunjukkan posisi baca pada navigasi.
  if ('IntersectionObserver' in window) {
    const pemantauBab = new IntersectionObserver(
      (daftarBagian) => {
        daftarBagian.forEach((bagian) => {
          if (!bagian.isIntersecting) return;
          menu.querySelectorAll('a').forEach((tautan) => {
            if (tautan.hash === `#${bagian.target.id}`)
              tautan.setAttribute('aria-current', 'location');
            else tautan.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-18% 0px -60% 0px', threshold: 0 },
    );
    document
      .querySelectorAll('main > section[id]')
      .forEach((bab) => pemantauBab.observe(bab));
  }

  // ILUSTRASI: kemiringan kecil mengikuti mouse; tidak berjalan pada layar sentuh.
  ilustrasi.addEventListener('pointermove', (kejadian) => {
    if (apakahGerakDijeda() || kejadian.pointerType !== 'mouse') return;
    const batas = ilustrasi.getBoundingClientRect();
    const x = Math.max(
      -1,
      Math.min(1, ((kejadian.clientX - batas.left) / batas.width) * 2 - 1),
    );
    const y = Math.max(
      -1,
      Math.min(1, ((kejadian.clientY - batas.top) / batas.height) * 2 - 1),
    );
    cancelAnimationFrame(bingkaiKemiringan);
    bingkaiKemiringan = requestAnimationFrame(() => {
      ilustrasi.style.setProperty('--miring-x', `${x * 2.5}deg`);
      ilustrasi.style.setProperty('--miring-y', `${-y * 2.5}deg`);
    });
  });
  ilustrasi.addEventListener('pointerleave', aturUlangKemiringan);

  const surat = document.querySelector('.surat');
  const petunjukSurat = surat.querySelector('.petunjuk-surat');
  surat.addEventListener('toggle', () => {
    // Isi aman berupa teks tetap, tanpa menerima HTML dari pengunjung.
    petunjukSurat.firstChild.textContent = surat.open ? 'Tutup surat ' : 'Buka surat ';
  });
})();
