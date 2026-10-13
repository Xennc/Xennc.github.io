/* PROFIL & MUSIK: isi catatan tetap di HTML; file ini hanya menambah kenyamanan. */
(() => {
  if ('showPopover' in HTMLElement.prototype) {
    const semuaCatatan = document.querySelectorAll('.catatan-profil');
    let posisiSaatDibuka = { x: window.scrollX, y: window.scrollY };

    semuaCatatan.forEach((catatan) => {
      const pemicu = document.querySelector(
        `[popovertarget="${catatan.id}"].label-profil`,
      );

      catatan.addEventListener('beforetoggle', (kejadian) => {
        if (kejadian.newState === 'open') {
          posisiSaatDibuka = { x: window.scrollX, y: window.scrollY };
        }
      });

      // Dekatkan catatan ke label, lalu batasi posisinya agar tetap muat di HP.
      catatan.addEventListener('toggle', (kejadian) => {
        if (kejadian.newState !== 'open') return;
        const batasPemicu = pemicu.getBoundingClientRect();
        const batasPanel = catatan.getBoundingClientRect();
        const kiri = Math.max(
          16,
          Math.min(batasPemicu.left, window.innerWidth - batasPanel.width - 16),
        );
        const atas = Math.max(
          16,
          Math.min(batasPemicu.bottom + 10, window.innerHeight - batasPanel.height - 16),
        );
        catatan.style.setProperty('--catatan-kiri', `${kiri}px`);
        catatan.style.setProperty('--catatan-atas', `${atas}px`);
        catatan.classList.add('posisi-diatur');
      });

      catatan.querySelectorAll('a').forEach((tautan) => {
        tautan.addEventListener('click', () => catatan.hidePopover());
      });
    });

    function tutupCatatanProfil(kejadian) {
      // Event scroll bisa terlambat tiba setelah klik. Tutup hanya jika posisi
      // benar-benar berubah sejak catatan dibuka, bukan karena event lama itu.
      if (
        kejadian.type === 'scroll' &&
        window.scrollX === posisiSaatDibuka.x &&
        window.scrollY === posisiSaatDibuka.y
      )
        return;
      semuaCatatan.forEach((catatan) => {
        if (catatan.matches(':popover-open')) catatan.hidePopover();
      });
    }
    window.addEventListener('resize', tutupCatatanProfil);
    window.addEventListener('scroll', tutupCatatanProfil, { passive: true });
  }

  // SPOTIFY: iframe baru dibuat setelah diminta; tidak memutar musik otomatis.
  const tombolMuat = document.getElementById('muat-spotify');
  const wadahPemutar = document.getElementById('wadah-spotify');
  const musisi = document.getElementById('pilihan-musisi');
  const tautanLangsung = document.querySelector('.tautan-musik');
  document.getElementById('kontrol-musik').hidden = false;

  function perbaruiMusisi() {
    const pilihan = musisi.selectedOptions[0];
    tautanLangsung.href = `https://open.spotify.com/artist/${pilihan.value}`;
    const pemutar = wadahPemutar.querySelector('iframe');
    if (!pemutar) return;
    pemutar.title = `Pilihan lagu ${pilihan.textContent} di Spotify`;
    pemutar.src = `https://open.spotify.com/embed/artist/${pilihan.value}?theme=0`;
  }

  musisi.addEventListener('change', perbaruiMusisi);
  tombolMuat.addEventListener(
    'click',
    () => {
      const pemutar = document.createElement('iframe');
      pemutar.className = 'bingkai-spotify';
      pemutar.allow = 'clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      pemutar.referrerPolicy = 'strict-origin-when-cross-origin';
      wadahPemutar.replaceChildren(pemutar);
      perbaruiMusisi();
      tombolMuat.setAttribute('aria-expanded', 'true');
      tombolMuat.hidden = true;
      // Tautan langsung tetap tersedia bila pemutar dibatasi browser/jaringan.
      pemutar.focus();
    },
    { once: true },
  );
})();
